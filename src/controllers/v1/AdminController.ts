"use strict";

import * as _ from "lodash";
import * as crypto from "crypto";
import * as promise from "bluebird";

import { encryptHashPassword, getRandomOtp, matchPassword, matchOTP, toObjectId } from "@utils/appUtils";
import { MESSAGES, STATUS, USER_TYPE, TOKEN_TYPE, SERVER } from "@config/index";
import { adminDaoV1, baseDao, loginHistoryDao, userDaoV1 } from "@dao/index";
import { mailManager } from "@lib/MailManager";
import { createToken } from "@lib/tokenManager";
import { redisClient } from "@lib/redis/RedisClient";


class AdminController {

	/**
	 * @function updateUserDataInDb
	 */
	async updateUserDataInDb(params) {
		try {
			await baseDao.updateMany("login_histories", { "userId._id": params._id }, { "$set": { userId: params } }, {});
			return {};
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function login
	 */
	async login(params: AdminRequest.Login) {
		try {
			const step1 = await adminDaoV1.isEmailExists(params);
			if (!step1) return Promise.reject(MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
			if (step1.status === STATUS.BLOCKED) return Promise.reject(MESSAGES.ERROR.BLOCKED);
			const isPasswordMatched = await matchPassword(params.password, step1.hash, step1.salt);
			if (!isPasswordMatched) return Promise.reject(MESSAGES.ERROR.INCORRECT_PASSWORD);
			else {
				await loginHistoryDao.removeDeviceById({ "userId": step1._id });
				const salt = crypto.randomBytes(64).toString("hex");
				const tokenData = {
					"userId": step1._id,
					"deviceId": params.deviceId,
					"accessTokenKey": salt,
					"type": TOKEN_TYPE.ADMIN_LOGIN,
					"userType": step1.userType
				};
				const [step2, accessToken] = await promise.join(
					loginHistoryDao.createUserLoginHistory({ ...params, ...step1, salt }),
					createToken(tokenData)
				);
				delete step1.salt; delete step1.hash; delete step1.createdAt;
				return MESSAGES.SUCCESS.LOGIN({ accessToken, ...step1 });
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function logout
	 */
	async logout(tokenData: TokenData) {
		try {
			await loginHistoryDao.removeDeviceById(tokenData);
			return MESSAGES.SUCCESS.LOGOUT;
		} catch (error) {
			throw error;
		}
	}

	/**   
	 * @function forgotPassword    
	 */
	async forgotPassword(params: AdminRequest.ForgotPasswordRequest) {
		try {
			const step1 = await adminDaoV1.isEmailExists(params); // check is email exist if not then restrict to send forgot password mail
			if (!step1) return Promise.reject(MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
			else if (step1.status === STATUS.BLOCKED) return Promise.reject(MESSAGES.ERROR.BLOCKED);
			else {
				let otp = getRandomOtp(4).toString();

				if (SERVER.IS_REDIS_ENABLE) redisClient.setExp(step1._id.toString(), (SERVER.TOKEN_INFO.EXPIRATION_TIME.FORGOT_PASSWORD / 1000), JSON.stringify({ "email": params.email, "otp": otp }));
				mailManager.forgotPasswordMail({ "email": params.email, "name": step1.name, "otp": otp });
				return MESSAGES.SUCCESS.SEND_OTP;
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function verifyOTP
	 * @description verify otp on forgot password
	 * @author Rajat Maheshwari
	 * @param params.email: admin's email (required)
	 * @param params.otp: otp (required)
	 */
	async verifyOTP(params: VerifyOTP) {
		try {
			const step1 = await adminDaoV1.isEmailExists(params);
			if (!step1) return Promise.reject(MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
			const step2 = await redisClient.getValue(step1._id.toString());

			const isOTPMatched = await matchOTP(params.otp, step2);
			if (!isOTPMatched) return Promise.reject(MESSAGES.ERROR.INVALID_OTP);
			//generate the jwt token for user
			const salt = crypto.randomBytes(64).toString("hex");
			const tokenData = {
				"userId": step1._id,
				"email": params.email,
				"accessTokenKey": salt,
				"userType": step1.userType,
				"type": TOKEN_TYPE.ADMIN_OTP_VERIFY
			};
			const accessToken = await createToken(tokenData);
			await redisClient.setExp(accessToken, SERVER.TOKEN_INFO.EXPIRATION_TIME.ADMIN_OTP_VERIFY, JSON.stringify({ "userId": step1._id }));

			return MESSAGES.SUCCESS.VERIFY_OTP({ token: accessToken });
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function resetPassword
	 * @author Rajat Maheshwari
	 */
	async resetPassword(params: AdminRequest.ChangeForgotPassword, tokenData) {
		try {

			const step1 = await adminDaoV1.findAdminById(tokenData.sub)
			if (!step1) return Promise.reject(MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
			params.hash = encryptHashPassword(params.password, step1.salt);
			await adminDaoV1.changePassword(params);
			return MESSAGES.SUCCESS.RESET_PASSWORD;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function changePassword
	 */
	async changePassword(params: ChangePasswordRequest, tokenData: TokenData) {
		try {
			const step1 = await adminDaoV1.findAdminById(tokenData.userId, { salt: 1, hash: 1 });
			const oldHash = encryptHashPassword(params.oldPassword, step1.salt);
			if (oldHash !== step1.hash) return Promise.reject(MESSAGES.ERROR.INVALID_OLD_PASSWORD);
			params.hash = encryptHashPassword(params.password, step1.salt);
			await adminDaoV1.changePassword(params, tokenData.userId);
			return MESSAGES.SUCCESS.CHANGE_PASSWORD;
		} catch (error) {
			throw error;
		}
	}


	/**
	 * @function adminDetails
	 */
	async adminDetails(tokenData: TokenData) {
		try {

			let admin = await adminDaoV1.findAdminById(tokenData.userId);
			let session = await loginHistoryDao.findDeviceLastLogin(tokenData);
			let permission = [];
			let roleName = "";

			let details = {
				"userId": admin._id,
				"email": admin.email,
				"name": admin.name,
				"profilePicture": admin.profilePicture,
				"createdAt": admin.createdAt,
				"lastLogin": session[0]?.createdAt,
				"permission": permission,
				"role": roleName,
				"userType": admin.userType
			};


			return MESSAGES.SUCCESS.DETAILS(details);
		} catch (error) {
			throw error;
		}
	}

	/**   
	 * @function timeSheetHistory   
	 * @author 
	 */
	async timeSheetHistory(params: UserRequest.TimeSHeetHistory, tokenData: TokenData) {
		try {

			const data = await adminDaoV1.timeSheetHistory(params, tokenData);
			//return data;
			return MESSAGES.SUCCESS.LIST(data);
		} catch (error) {
			throw error;
		}
	}



	/**    
	 * @function editProfile
	 */
	async editProfile(params: AdminRequest.EditProfile, tokenData: TokenData) {
		try {
			const isExist = await adminDaoV1.isEmailExists(params, tokenData.userId);
			if (isExist) return Promise.reject(MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
			const step1 = await adminDaoV1.editProfile(params, tokenData.userId);
			this.updateUserDataInDb(step1);
			return MESSAGES.SUCCESS.EDIT_PROFILE;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function dashboard   
	 */
	async dashboard(params: AdminRequest.Dashboard) {
		try {
			const [participants, supporters] = await promise.join(
				await baseDao.countDocuments("users", { "userType": USER_TYPE.PARTICIPANT, "status": { "$ne": STATUS.DELETED } }),
				await baseDao.countDocuments("users", { "userType": USER_TYPE.SUPPORTER, "status": { "$ne": STATUS.DELETED } })
			);
			return MESSAGES.SUCCESS.DETAILS({ participants, supporters });
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function composeMail
	 */
	async composeMail(params: AdminRequest.ComposeMail, tokenData) {
		try {

			let otp = getRandomOtp(5).toString();
			console.log(otp);
			mailManager.composeMail(params);


			return MESSAGES.SUCCESS.MAIL_SENT;

		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function userList
	 */
	async userList(params: AdminRequest.UserListing) {
		try {
			const data = await userDaoV1.userList(params);
			if (params.latestUsers) {
				const query: any = {};
				query.status = { "$ne": STATUS.DELETED };
				query.name = { $exists: true, $ne: null }
				query.createdAt = { "$gte": new Date(new Date().setHours(0, 0, 0, 0)), "$lt": new Date(new Date().setHours(23, 59, 59, 999)) };
				data.total = await baseDao.countDocuments("users", query);
			}
			return MESSAGES.SUCCESS.LIST(data);
		} catch (error) {
			throw error;
		}
	}
}

export const adminController = new AdminController();