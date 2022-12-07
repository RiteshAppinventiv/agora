"use strict";

import * as _ from "lodash";
import * as crypto from "crypto";
import * as mongoose from "mongoose";
import * as promise from "bluebird";


import {
	buildToken,
	encryptHashPassword,
	getRandomOtp,
	getLocationByIp,
	matchPassword,
	matchOTP,
	toObjectId,

} from "@utils/appUtils";
import {

	JOB_SCHEDULER_TYPE,
	FRIEND_REQUEST_STATUS,
	MESSAGES,

	PARTICIPANT_PROFILE_STEPS,

	STATUS,
	SUPPORTER_PROFILE_STEPS,
	TOKEN_TYPE,
	SERVER,
	USER_TYPE,
	UPDATE_TYPE,

	TEMPLATES,
	HTTP_STATUS_CODE,
	NOTIFICATION_DATA,

} from "@config/index";
import {

	baseDao,
	categoryDaoV1,
	friendDaoV1,
	loginHistoryDao,
	ratingDaoV1,
	userDaoV1,
	adminDaoV1
} from "@dao/index";
import { redisClient } from "@lib/redis/RedisClient";
import { sendMessageToFlock } from "@utils/FlockUtils";
import { createToken } from "@lib/tokenManager";
import { mailManager } from "@lib/MailManager";
import { smsManager } from "@lib/SMSManager";
import { Twilio } from "@utils/Twillo";
import {
	RtcTokenBuilder,
	RtmTokenBuilder,
	RtcRole,
	RtmRole
} from "agora-access-token";
import { agoraToken } from "@lib/agoraToken";
import { createPayloadAndSendPush } from "@lib/pushNotification/pushManager";

let twilio = new Twilio();
export class UserController {

	async removeSession(params, isSingleSession: boolean) {
		try {
			if (isSingleSession)
				await loginHistoryDao.removeDeviceById({ "userId": params.userId });
			else
				await loginHistoryDao.removeDeviceById({ "userId": params.userId, "deviceId": params.deviceId });

			if (SERVER.IS_REDIS_ENABLE) {
				if (isSingleSession) {
					let keys: any = await redisClient.getKeys(`*${params.userId}*`);
					keys = keys.filter(v1 => Object.values(JOB_SCHEDULER_TYPE).findIndex(v2 => v2 === v1.split(".")[0]) === -1);
					if (keys.length) await redisClient.deleteKey(keys);
				} else
					await redisClient.deleteKey(`${params.userId}.${params.deviceId}`);
			}
		} catch (error) {
			sendMessageToFlock({ "title": "_removeSession", "error": error.stack });
		}
	};

	/**
	 * @function updateUserDataInRedis
	 */
	async updateUserDataInRedis(params, isAlreadySaved = false) {
		try {
			delete params.salt;
			if (SERVER.IS_REDIS_ENABLE) {
				let keys: any = await redisClient.getKeys(`*${params.userId || params._id.toString()}*`);
				keys = keys.filter(v1 => Object.values(JOB_SCHEDULER_TYPE).findIndex(v2 => v2 === v1.split(".")[0]) === -1);
				const promiseResult = [], array = [];
				for (let i = 0; i < keys.length; i++) {
					if (isAlreadySaved) {
						let userData: any = await redisClient.getValue(`${params.userId || params._id.toString()}.${keys[i].split(".")[1]}`);
						array.push(keys[i]);
						array.push(JSON.stringify(buildToken(_.extend(JSON.parse(userData), params))));
						promiseResult.push(userData);
					} else {
						array.push(keys[i]);
						array.push(JSON.stringify(buildToken(params)));
					}
				}
				await Promise.all(promiseResult);
				if (array.length) redisClient.mset(array);
			}
			return {};
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function updateUserDataInDb
	 */
	async updateUserDataInDb(params) {
		try {
			await baseDao.updateMany("login_histories", { "userId._id": params._id }, { "$set": { userId: params } }, {});

			await baseDao.updateMany("activities", { "organizerId._id": params._id }, { "$set": { organizerId: params } }, {});
			const update1 = {};
			if (params.name) update1["attendees.$.name"] = params.name;
			if (params.profilePicture) update1["attendees.$.profilePicture"] = params.profilePicture;
			await baseDao.updateMany("activities", { "attendees._id": params._id }, { "$set": update1 }, {});
			const update2 = {};
			if (params.name) update2["notes.$.name"] = params.name;
			if (params.profilePicture) update2["notes.$.profilePicture"] = params.profilePicture;
			await baseDao.updateMany("activities", { "notes.userId": params._id }, { "$set": update2 }, {});
			// const update2 = {};
			// update2["organizerId"] = params;
			// if (params.name) update2["attendees.$.name"] = params.name;
			// if (params.profilePicture) update2["attendees.$.profilePicture"] = params.profilePicture;
			// await baseDao.updateMany("activities", { "organizerId._id": params._id, "attendees._id": params._id }, { "$set": update2 }, {});

			await baseDao.updateMany("groups", { "organizerId._id": params._id }, { "$set": { organizerId: params } }, {});
			await baseDao.updateMany("groups", { "attendees._id": params._id }, { "$set": update1 }, {});

			await baseDao.updateMany("incidents", { "reporterId._id": params._id }, { "$set": { reporterId: params } }, {});
			const update3 = {};
			if (params.name) update3["peopleInvolved.$.name"] = params.name;
			if (params.profilePicture) update3["peopleInvolved.$.profilePicture"] = params.profilePicture;
			await baseDao.updateMany("incidents", { "peopleInvolved._id": params._id }, { "$set": update3 }, {});

			await baseDao.updateMany("friends", { "friendId._id": params._id }, { "$set": { friendId: params } }, {});
			return {};
		} catch (error) {
			throw error;
		}
	}


	/**
	 * @function signUp
	 * @description signup of participant/supporter
	 * @author Rajat Maheshwari
	 * @param params.email: user's email (required)
	 * @param params.password: user's password (required)
	 * @param params.userType: user type (required)
	 */
	async signUp(params: UserRequest.SignUp) {
		const session = await mongoose.startSession();
		session.startTransaction();
		try {
			const isExist = await userDaoV1.isEmailExists(params);
			const step1: any = await baseDao.findOne("users", { email: params.email, status: STATUS.UN_BLOCKED }, { isEmailVerified: 1 })
			if (isExist && step1) {
				const userData: any = await baseDao.findOne("users", { email: params.email }, { isEmailVerified: 1 })
				if (userData.isEmailVerified) {
					return Promise.reject(MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
				}
				const hash: string = encryptHashPassword(params.password, isExist.salt);
				await userDaoV1.updateOne("users", { email: params.email }, { hash: hash }, {});
				return Promise.reject(MESSAGES.ERROR.EMAIL_NOT_VERIFIED(HTTP_STATUS_CODE.EMAIL_NOT_VERIFIED));
			}
			else {
				const userDetails = await userDaoV1.signUp(params, session);
				const otp = getRandomOtp(4).toString();
				console.log('email', userDetails.email, ' has otp: ', otp);
				mailManager.verifyEmail({ "email": params.email, otp });
				if (SERVER.IS_REDIS_ENABLE) redisClient.setExp(params.email, (SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL / 1000), JSON.stringify({ "email": params.email, "otp": otp }));
				await session.commitTransaction();
				session.endSession();
				return MESSAGES.SUCCESS.SIGNUP({
					isEmailVerified: false,
					email: params.email,
					_id: userDetails._id
				});
			}
		} catch (error) {
			await session.abortTransaction();
			session.endSession();
			throw error;
		}
	}
	/**
	 * @function sendOTP
	 * @description send/resend otp on email/phone number
	 * @author Rajat Maheshwari
	 * @param params.email: user's email (required)   
	 */
	async sendOTP(params: UserRequest.SendOtp) {
		try {
			const step1 = await userDaoV1.isEmailExists(params);
			if (!step1) return Promise.reject(MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
			if (step1.status === STATUS.BLOCKED) return Promise.reject(MESSAGES.ERROR.BLOCKED);
			const otp = getRandomOtp(5).toString();
			console.log(otp);
			if (params.type === "EMAIL") {
				mailManager.forgotPasswordMail({ "email": params.email, otp });
				if (SERVER.IS_REDIS_ENABLE) redisClient.setExp(params.email, (SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL / 1000), JSON.stringify({ "email": params.email, "otp": otp }));
			} else {
				const isExist = await userDaoV1.isMobileExists({ "countryCode": "61", ...params }, step1._id);
				if (isExist) return Promise.reject(MESSAGES.ERROR.MOBILE_NO_ALREADY_EXIST);

				//	smsManager.sendOTP("61", params.mobileNo, otp);
				console.log(process.env.TWILIO_FROM, 'lllllllllllllllll')
				let msg = await twilio.createMessage({ "content": TEMPLATES.SMS.OTP + otp + TEMPLATES.SMS.THANKS, "from": '+17625852586', "to": "+919012722704" });
				console.log(msg, 'gggggggggggggggggggggg')
				await baseDao.updateOne("users", { "email": params.email }, { "$set": { "countryCode": "61", "mobileNo": params.mobileNo, fullMobileNo: "61" + params.mobileNo } }, {});
				if (SERVER.IS_REDIS_ENABLE) redisClient.setExp("61" + params.mobileNo, (SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_MOBILE / 1000), JSON.stringify({ "countryCode": "61", "mobileNo": params.mobileNo, "otp": otp }));
			}
			return MESSAGES.SUCCESS.SEND_OTP;
		} catch (error) {
			throw error;
		}
	}


	/**
	 * @function verifyOTP
	 * @description verify otp on forgot password/verify number
	 * @author Imran
	 * @param params.email: user's email (required)
	 * @param params.otp: otp (required)
	 */
	async verifyOTP(params: UserRequest.VerifyOTP) {
		try {
			const step1 = await userDaoV1.isEmailExists(params);
			if (!step1) return Promise.reject(MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
			let step2 = await redisClient.getValue(params.email);
			const isOTPMatched = await matchOTP(params.otp, step2);
			if (!isOTPMatched) return Promise.reject(MESSAGES.ERROR.INVALID_OTP);
			const toUpdate = {
				"isEmailVerified": true
			};
			const toFilter = {
				email: params.email,
				status: { $nin: [STATUS.DELETED, STATUS.BLOCKED] }
			}
			await baseDao.findOneAndUpdate("users", toFilter, toUpdate);
			let userId = await userDaoV1.findOne("users", toFilter, { _id: 1 })
			userId = userId._id;
			console.log("------- ", userId);

			const salt = crypto.randomBytes(64).toString("hex");
			const tokenData = {
				"userId": step1._id,
				"deviceId": params.deviceId,
				"accessTokenKey": salt,
				"type": TOKEN_TYPE.USER_LOGIN,
				"userType": USER_TYPE.USER
			};
			let dataToReturn;
			if (params.type == "SIGNUP" || params.type == "LOGIN") {
				await this.removeSession({ "userId": step1._id, "deviceId": params.deviceId }, SERVER.IS_SINGLE_DEVICE_LOGIN[USER_TYPE.USER]);
				const salt = crypto.randomBytes(64).toString("hex");
				const tokenData = {
					"userId": step1._id,
					"deviceId": params.deviceId,
					"accessTokenKey": salt,
					"type": TOKEN_TYPE.USER_LOGIN,
					"userType": USER_TYPE.USER
				};
				// const location = await getLocationByIp(params.remoteAddress); // get location (timezone, lat, lng) from ip address
				// console.log("create session",{ ...params, ...step1, salt, location });

				console.log("before session", { ...params, ...step1, salt })
				const [step2, accessToken] = await promise.join(
					loginHistoryDao.createUserLoginHistory({ ...params, ...step1, salt }),
					createToken(tokenData)
				);
				console.log("after session")
				if (SERVER.IS_REDIS_ENABLE) redisClient.setExp(`${step1._id.toString()}.${params.deviceId}`, Math.floor(SERVER.TOKEN_INFO.EXPIRATION_TIME[TOKEN_TYPE.USER_LOGIN] / 1000), JSON.stringify(buildToken({ ...step1, ...params, salt })));
				dataToReturn = {
					accessToken,
					"userId": userId,
					"email": step1.email,
					"isEmailVerified": true,
					"name": step1.name,
					"isSpecialtyUpdated": step1.isSpecialtyUpdated,
					"isDiseaseUpdated": step1.isDiseaseUpdated,
					"isSubSpecialtyUpdated": step1.isSubSpecialtyUpdated,
					"specialty": step1.specialty ? step1.specialty : "",
					"subSpecialty": step1.subSpecialty ? step1.subSpecialty : [],
					"disease": step1.disease ? step1.disease : [],
					"profilePicture": step1.profilePicture
				};
				mailManager.welcomeEmail(params)
			} else {
				dataToReturn = {
					"userId": userId,
					"isEmailVerified": true,
					"email": step1.email
				}
			}
			redisClient.deleteKey(params.email)
			return MESSAGES.SUCCESS.VERIFY_OTP(dataToReturn);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function login
	 * @description signup of participant/supporter
	 * @author Rajat Maheshwari
	 * @param params.email: user's email (required)
	 * @param params.password: user's password (required)
	 * @param params.deviceId: device id (required)
	 * @param params.deviceToken: device token (required)
	 */
	async login(params: UserRequest.Login) {
		try {
			params.userType = USER_TYPE.USER;
			const step1 = await userDaoV1.isEmailExists(params);
			console.log("--------===========------- ", step1);
			if (!step1) return Promise.reject(MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
			if (step1.status === STATUS.BLOCKED) return Promise.reject(MESSAGES.ERROR.BLOCKED);

			const isPasswordMatched = await matchPassword(params.password, step1.hash, step1.salt);
			if (!isPasswordMatched) return Promise.reject(MESSAGES.ERROR.INCORRECT_PASSWORD);

			if (!step1.isEmailVerified) {
				const otp = getRandomOtp(4).toString();
				console.log("login email not verified", step1.email, "otp", otp);
				mailManager.verifyEmail({ "email": params.email, otp });
				if (SERVER.IS_REDIS_ENABLE) redisClient.setExp(params.email, (SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL / 1000), JSON.stringify({ "email": params.email, "otp": otp }));
				return MESSAGES.SUCCESS.LOGIN({
					"userId": step1._id,
					"email": step1.email,
					"name": step1.name,
					"isEmailVerified": step1.isEmailVerified
				});;
			}
			else {
				await this.removeSession({ "userId": step1._id, "deviceId": params.deviceId }, SERVER.IS_SINGLE_DEVICE_LOGIN[USER_TYPE.USER]);
				const salt = crypto.randomBytes(64).toString("hex");
				const tokenData = {
					"userId": step1._id,
					"deviceId": params.deviceId,
					"accessTokenKey": salt,
					"type": TOKEN_TYPE.USER_LOGIN,
					"userType": USER_TYPE.USER
				};
				// const location = await getLocationByIp(params.remoteAddress); // get location (timezone, lat, lng) from ip address
				// console.log("create session",{ ...params, ...step1, salt, location });

				const [step2, accessToken] = await promise.join(
					loginHistoryDao.createUserLoginHistory({ ...params, ...step1, salt }),
					createToken(tokenData)
				);
				if (SERVER.IS_REDIS_ENABLE) redisClient.setExp(`${step1._id.toString()}.${params.deviceId}`, Math.floor(SERVER.TOKEN_INFO.EXPIRATION_TIME[TOKEN_TYPE.USER_LOGIN] / 1000), JSON.stringify(buildToken({ ...step1, ...params, salt })));
				return MESSAGES.SUCCESS.LOGIN({
					accessToken,
					"userId": step1._id,
					"email": step1.email,
					"name": step1.name,
					"isEmailVerified": step1.isEmailVerified,
					"isSpecialtyUpdated": step1.isSpecialtyUpdated,
					"isDiseaseUpdated": step1.isDiseaseUpdated,
					"isSubSpecialtyUpdated": step1.isSubSpecialtyUpdated,
					"specialty": step1.specialty ? step1.specialty : "",
					"subSpecialty": step1.subSpecialty ? step1.subSpecialty : [],
					"disease": step1.disease ? step1.disease : [],
					"profilePicture": step1.profilePicture
				});
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function forgotPassword
	 */
	async forgotPassword(params: UserRequest.ForgotPassword) {
		try {
			const step1 = await userDaoV1.isEmailExists(params); // check is email exist if not then restrict to send forgot password mail
			if (!step1) return Promise.reject(MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
			else if (step1.status === STATUS.BLOCKED) return Promise.reject(MESSAGES.ERROR.BLOCKED);
			else {
				let otp = getRandomOtp(5).toString();
				console.log(otp);
				if (SERVER.IS_REDIS_ENABLE) redisClient.setExp(params.email, (SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL / 1000), JSON.stringify({ "email": params.email, "otp": otp }));
				mailManager.forgotPasswordMail({ "email": params.email, "name": step1.name, "otp": otp });
				return MESSAGES.SUCCESS.SEND_OTP;
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function resetPassword
	 * @author Rajat Maheshwari
	 */
	async resetPassword(params: UserRequest.ChangeForgotPassword) {
		try {
			if (params.newPassword !== params.confirmPassword) return Promise.reject(MESSAGES.ERROR.NEW_CONFIRM_PASSWORD);
			const step1 = await userDaoV1.isEmailExists(params); // check is email exist if not then restrict to send forgot password mail
			if (!step1) return Promise.reject(MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
			params.hash = encryptHashPassword(params.newPassword, step1.salt);
			await userDaoV1.changePassword(params);
			return MESSAGES.SUCCESS.RESET_PASSWORD;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function logout
	 * @author Rajat Maheshwari
	 */
	async logout(tokenData: TokenData) {
		try {
			await this.removeSession(tokenData, SERVER.IS_SINGLE_DEVICE_LOGIN[tokenData.userType]);
			return MESSAGES.SUCCESS.USER_LOGOUT;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function profile
	 * @author Rajat Maheshwari
	 */
	async profile(params: UserId, tokenData: TokenData) {
		try {
			const step1 = await userDaoV1.findUserById(params.userId || tokenData.userId);
			if (!step1) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);
			if (tokenData.userType === USER_TYPE.ADMIN) {
				const documents = [];
				for (const v in step1.documents) {
					documents.push({ [v]: step1.documents[v] });
				}
				step1.documents = documents;
				delete step1.pushNotificationStatus; delete step1.groupaNotificationStatus;
			}

			delete step1.location; delete step1.updateType; delete step1.created; delete step1.salt;
			delete step1.hash; delete step1.isMobileVerified; delete step1.favouriteUsers; delete step1.documentUploadToken;
			return MESSAGES.SUCCESS.DETAILS(step1);
		} catch (error) {
			throw error;
		}
	}



	/**
	 * @function blockUnblockUser
	 * @author Rajat Maheshwari
	 */
	async blockUnblockUser(params: BlockRequest) {
		try {
			const step1 = await userDaoV1.blockUnblock(params);
			switch (params.status) {
				case STATUS.BLOCKED: {
					const userName = `${step1?.firstName} ${step1?.lastName}`;
					mailManager.accountBlocked({ "email": step1.email, "name": userName, "reason": params.reason });
					return MESSAGES.SUCCESS.BLOCK_USER;
				}
				case STATUS.UN_BLOCKED:
					return MESSAGES.SUCCESS.UNBLOCK_USER;
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function chatUserList
	 * @author  
	 */
	async chatUserList(params, tokenData) {
		try {
			let findUser = await baseDao.findOne('users', { _id: tokenData.userId }, { favouriteUsers: 1 });
			let finalData = {};
			//fav user
			params.users = findUser.favouriteUsers;
			let favUser = await userDaoV1.chatFriendList(params)
			finalData['favouriteUsers'] = favUser;
			//friends user
			delete (params.users);
			const allUsers = await friendDaoV1.getAllFriends(tokenData.userId);
			const userIds = [];
			allUsers.forEach(v => {
				if (v.userId.toString() !== tokenData.userId) userIds.push(v.userId);
				if (v.friendId._id.toString() !== tokenData.userId) userIds.push(v.friendId._id);
			});

			params.users = userIds;
			let friends = await userDaoV1.chatFriendList(params);
			finalData['friends'] = friends;

			//participant user
			let participantUser = await userDaoV1.chatParticipantSupportList(params, USER_TYPE.PARTICIPANT)
			finalData['particpant'] = participantUser;
			//supporter
			let supporterUser = await userDaoV1.chatParticipantSupportList(params, USER_TYPE.SUPPORTER)
			finalData['supporter'] = supporterUser;
			return MESSAGES.SUCCESS.DETAILS(finalData);
		} catch (error) {
			throw error;
		}
	}


	/**
	 * @function verifyUser
	 * @author Rajat Maheshwari
	 */
	async verifyUser(params: UserRequest.VerifyUser) {
		try {
			params["updateType"] = UPDATE_TYPE.APPROVED_DECLINED;
			if (!params.isApproved) params.declinedReason = params.reason;
			const step1 = await userDaoV1.verifyUser(params);
			if (!params.isApproved) {
				const userName = `${step1?.firstName} ${step1?.lastName}`;
				mailManager.verificationStatus({ "email": step1.email, "name": userName, "reason": params.reason });
			}
			return params.isApproved ? MESSAGES.SUCCESS.VERIFICATION_APPROVED : MESSAGES.SUCCESS.VERIFICATION_REJECTED;
		} catch (error) {
			throw error;
		}
	}




	/**
	 * @function editProfilePic
	 * @author 
	 */
	async editProfilePic(params: UserRequest.EditProfilePic, tokenData: TokenData) {
		try {
			params["updateType"] = UPDATE_TYPE.SET_PROFILE_PIC;
			//	await userDaoV1.editProfile(params, tokenData.userId, [PARTICIPANT_PROFILE_STEPS.ADD_PHOTO.type]);
			return MESSAGES.SUCCESS.ADD_PHOTO;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editSetting
	 * @author 
	 */
	async editSetting(params: UserRequest.Setting, tokenData: TokenData) {
		try {
			await userDaoV1.updateOne("users", { "_id": tokenData.userId }, params, {});
			await loginHistoryDao.updateOne("login_histories", { "userId._id": tokenData.userId, isLogin: true }, { "userId.pushNotificationStatus": params.pushNotificationStatus }, {})
			return MESSAGES.SUCCESS.DEFAULT;
		} catch (error) {
			throw error;
		}
	}













	/**
	 * @function editAboutSection
	 */
	async editAboutSection(params) {
		try {
			const userData = await userDaoV1.findUserById(params.userId, { _id: 1, profileSteps: 1, userType: 1 });
			params.updateType = UPDATE_TYPE.ABOUT_ME;
			const profileSteps = [];

			if (params?.tags?.length) {
				const categories = [];
				for await (const v of params.tags) {
					const isExist = await categoryDaoV1.isCategoryExists({ "name": v });
					if (!isExist)
						categories.push(await categoryDaoV1.addCategory({ "name": v }));
					else
						categories.push(isExist);
				}
				params.categories = categories;
			}
			await userDaoV1.editProfile(params, userData._id, profileSteps);
			return MESSAGES.SUCCESS.EDIT_PROFILE;
		} catch (error) {
			throw error;
		}
	}





	/**
	 * @function manageNotification
	 * @author Rajat Maheshwari
	 */
	async manageNotification(params: UserRequest.ManageNotification, tokenData: TokenData) {
		try {
			if (("pushNotificationStatus" in params) && (params.pushNotificationStatus || !params.pushNotificationStatus)) {
				await baseDao.updateOne("users", { "_id": tokenData.userId }, { "$set": { pushNotificationStatus: params.pushNotificationStatus } }, {});
				baseDao.updateMany("login_histories", { "userId": tokenData.userId }, { "$set": { "userId.pushNotificationStatus": params.pushNotificationStatus } }, {});
			}
			if (("groupaNotificationStatus" in params) && (params.groupaNotificationStatus || !params.groupaNotificationStatus)) {
				await baseDao.updateOne("users", { "_id": tokenData.userId }, { "$set": { groupaNotificationStatus: params.groupaNotificationStatus } }, {});
				baseDao.updateMany("login_histories", { "userId": tokenData.userId }, { "$set": { "userId.groupaNotificationStatus": params.groupaNotificationStatus } }, {});
			}
			return MESSAGES.SUCCESS.PROFILE_SETTINGS;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function notificationStatus
	 * @author 
	 */
	async notificationStatus(params: UserRequest.NotificationStatus, tokenData: TokenData) {
		try {
			let notificationData = baseDao.findOne("notifications", { _id: params.notificationId }, { _id: 1 })
			if (notificationData) {
				await baseDao.updateOne("notifications", { "_id": params.notificationId }, { "$set": { isRead: params.isRead } }, {});

			}
			return MESSAGES.SUCCESS.DEFAULT;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function NotificationList   
	 * @author 
	 */
	async NotificationList(params: UserRequest.NotificationList, tokenData: TokenData) {
		try {

			const data = await userDaoV1.notificationList(params, tokenData);
			//return data;
			return MESSAGES.SUCCESS.LIST(data);
		} catch (error) {
			throw error;
		}
	}



	/**
	 * @function resendOtp
	 */
	async resendOtp(params: UserRequest.RESEND_OTP) {
		try {
			const step1 = await userDaoV1.isEmailExists(params); // check is email exist if not then restrict to send forgot password mail
			if (!step1) return Promise.reject(MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
			else if (step1.status === STATUS.BLOCKED) return Promise.reject(MESSAGES.ERROR.BLOCKED);
			else {
				let otp = getRandomOtp(4).toString();
				console.log("resend otp email-", step1.email, "has otp", otp, "from params", params.type);
				if (SERVER.IS_REDIS_ENABLE) redisClient.setExp(params.email, (SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL / 1000), JSON.stringify({ "email": params.email, "otp": otp }));
				mailManager.resentOtp({ "email": params.email, "name": step1.name, "otp": otp });
				return MESSAGES.SUCCESS.SEND_OTP;
			}
		} catch (error) {
			throw error;
		}
	}


	/**
	 * @function AdminNotificationList   
	 * @author 
	 */
	async AdminNotificationList(params: UserRequest.NotificationList, tokenData: TokenData) {
		try {

			const data = await userDaoV1.adminNotificationList(params, tokenData);
			//return data;
			return MESSAGES.SUCCESS.LIST(data);
		} catch (error) {
			throw error;
		}
	}



	/**
	 * @function getAgoraToken   
	 * @author 
	 */
	async getAgoraToken(params: UserRequest.AgoraToken) {
		try {

			let {
				userid,
				uid,
				agoraChannelName,
				expirationTimeInSeconds,
				role,
				account
			} = params;
			let data: any = {};
			const appID = SERVER.AGORA.APP_ID;
			const appCertificate = SERVER.AGORA.APP_CERT;
			console.log('appIDappID', appID);

			if (!account)
				account = "2882341273";

			if (role)
				role = RtcRole.SUBSCRIBER;
			else
				role = RtcRole.PUBLISHER;

			if (!agoraChannelName)
				agoraChannelName = "RCC";// '<The channel this token is generated for>';

			if (!uid)
				uid = 0;


			if (!expirationTimeInSeconds)
				expirationTimeInSeconds = 3600

			const currentTimestamp = Math.floor(Date.now() / 1000)

			const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds
			// IMPORTANT! Build token with either the uid or with the user account. 
			//Comment out the option you do not want to use below.

			// Build token with uid
			const tokenWithUid = RtcTokenBuilder.buildTokenWithUid(appID, appCertificate, agoraChannelName, uid, role, privilegeExpiredTs);
			console.log("Token With Integer Number Uid: " + tokenWithUid);

			// Build token with user account
			const tokenWithAccount = RtcTokenBuilder.buildTokenWithAccount(appID, appCertificate, agoraChannelName, account, role, privilegeExpiredTs);
			console.log("Token With UserAccount: " + tokenWithAccount);
			await promise.join(tokenWithUid, tokenWithAccount);
			data.tokenWithUid = tokenWithUid;
			data.tokenWithAccount = tokenWithAccount;

			return MESSAGES.SUCCESS.DETAILS(data);
		} catch (error) {
			throw error;
		}
	}

	async generateAgoraToken(payload: UserRequest.AgoraToken, tokenData: TokenData) {
		try {
			const data = await agoraToken(payload);
			if (data.tokenAccount && data.tokenUid) {
				return MESSAGES.SUCCESS.DETAILS(data);
			}
		} catch (error) {
			throw error;
		}
	}


	async callNotification(payload: UserRequest.CallNotification, tokenData: TokenData) {
		try {
			const userId = tokenData.userId;
			console.log('******************** USER <--> USER ***************************');

			const step1 = await userDaoV1.findUserById(userId);
			if (!step1) return Promise.reject(MESSAGES.ERROR.EMAIL_NOT_REGISTERED);

			const step2 = await userDaoV1.findUserById(payload.subscriberId);
			if (!step2) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);
			let notificationData = NOTIFICATION_DATA.ADD_EDIT_EVENT("en", payload.subscriberId, {}, '');
			notificationData = _.extend(notificationData, { "receiverId": [payload.subscriberId], senderUserName: step1.firstName });
			notificationData = _.extend(notificationData, payload);
			console.log('notificationData', notificationData)
			const options: any = { lean: true };
			const tokens = await baseDao.find("login_histories", { "userId._id": toObjectId(payload.subscriberId), "isLogin": true, "userId.pushNotificationStatus": true, "userId.status": STATUS.UN_BLOCKED }, { userId: 1, platform: 1, deviceToken: 1 }, options, {}, {}, {});
			console.log('step3', tokens);	// update device token with voip token				
			if (tokens.length) {
				await createPayloadAndSendPush(tokens, notificationData);
			}
			else
				console.log("receiver has not logged in");
			//send notification with voip id
		} catch (error) {
			throw error;
		}
	}

	async declineCallNotification(payload: UserRequest.DeclineCallNotification, tokenData: TokenData) {
		try {
			const userId = tokenData.userId;
			let step1 = await userDaoV1.findUserById(userId);// receiver
			if (!step1) return Promise.reject(MESSAGES.ERROR.EMAIL_NOT_REGISTERED);
			
			let step2 = await userDaoV1.findUserById(payload.publisherId);//sender
			if (!step2) return Promise.reject(MESSAGES.ERROR.USER_NOT_FOUND);
			
			let notificationData = NOTIFICATION_DATA.ADD_EDIT_EVENT("en", payload.publisherId, {}, '');
			notificationData = _.extend(notificationData, { "receiverId": [payload.publisherId], "subscriberName": step1.firstName });
			console.log('notificationData', notificationData)
			const options: any = { lean: true };
			const tokens = await baseDao.find("login_histories", { "userId._id": toObjectId(payload.publisherId), "isLogin": true, "userId.pushNotificationStatus": true, "userId.status": STATUS.UN_BLOCKED }, { userId: 1, platform: 1, deviceToken: 1 }, options, {}, {}, {});
			console.log('tokens', tokens);
			if (tokens.length) await createPayloadAndSendPush(tokens, notificationData);
		} catch (error) {
			throw error;
		}
	}

}

export const userController = new UserController();