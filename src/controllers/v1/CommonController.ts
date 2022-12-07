"use strict";

import * as _ from "lodash";
import { Request } from "@hapi/hapi";

import {

	baseDao
} from "@dao/index";

import {
	MESSAGES,

	SUPPORTER_PROFILE_STEPS,
	USER_TYPE,
	SERVER
} from "@config/index";
import { TemplateUtil } from "@utils/TemplateUtil";


export class CommonController {

	/**
	 * @function deepLink
	 */
	async deepLink(request: Request, params: DeeplinkRequest) {
		try {
			console.log("deepLink===================>", JSON.stringify(params));
			switch (params.type) {
				case SUPPORTER_PROFILE_STEPS.UPLOAD_SUPPORTING_DOCUMENT.type: {
					const userData = await baseDao.findOne("users", { "documentUploadToken.supportingDocument": params.token }, { _id: 1 });
					console.log(userData, 'lllllllllllllllllllllllllll')
					if (!userData) return Promise.reject(MESSAGES.ERROR.BAD_TOKEN);
					const responseHtml = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "deeplink.html"))
						.compileFile({
							url: "", // android scheme,
							iosLink: "", // ios scheme
							fallback: `${SERVER.ADMIN_URL}/documents-upload?token=${params.token}&type=${params.type}`,
							title: SERVER.APP_NAME,
							android_package_name: "",
							ios_store_link: ""
						});

					return responseHtml;
				}
				case SUPPORTER_PROFILE_STEPS.UPLOAD_CERTIFICATIONS.type: {
					const userData = await baseDao.findOne("users", { "documentUploadToken.educationCertificate": params.token }, { _id: 1 });
					if (!userData) return Promise.reject(MESSAGES.ERROR.BAD_TOKEN);
					const responseHtml = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "deeplink.html"))
						.compileFile({
							url: "", // android scheme,
							iosLink: "", // ios scheme
							fallback: `${SERVER.ADMIN_URL}/documents-upload?token=${params.token}&type=${params.type}`,
							title: SERVER.APP_NAME,
							android_package_name: "",
							ios_store_link: ""
						});

					return responseHtml;
				}
				case SUPPORTER_PROFILE_STEPS.UPLOAD_RESUME.type: {
					const userData = await baseDao.findOne("users", { "documentUploadToken.resume": params.token }, { _id: 1 });
					if (!userData) return Promise.reject(MESSAGES.ERROR.BAD_TOKEN);
					const responseHtml = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "deeplink.html"))
						.compileFile({
							url: "", // android scheme,
							iosLink: "", // ios scheme
							fallback: `${SERVER.ADMIN_URL}/documents-upload?token=${params.token}&type=${params.type}`,
							title: SERVER.APP_NAME,
							android_package_name: "",
							ios_store_link: ""
						});

					return responseHtml;
				}
				case SUPPORTER_PROFILE_STEPS.NDIS_TRAINING_CERTIFICATE.type: {
					const userData = await baseDao.findOne("users", { "documentUploadToken.ndisTrainingCertificate": params.token }, { _id: 1 });
					if (!userData) return Promise.reject(MESSAGES.ERROR.BAD_TOKEN);
					const responseHtml = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "deeplink.html"))
						.compileFile({
							url: "", // android scheme,
							iosLink: "", // ios scheme
							fallback: `${SERVER.ADMIN_URL}/documents-upload?token=${params.token}&type=${params.type}`,
							title: SERVER.APP_NAME,
							android_package_name: "",
							ios_store_link: ""
						});

					return responseHtml;
				}
				// case "FORGOT_PASSWORD": {
				// 	const payload = await decode(params.token, request, false);
				// 	const step1 = await baseDao.findOne("admins", { "forgotToken": payload.prm });
				// 	if (!step1) return Promise.reject(MESSAGES.ERROR.BAD_TOKEN);
				// 	else {
				// 		const isExpire = isTimeExpired(payload.exp * 1000);
				// 		if (isExpire) {
				// 			await adminDaoV1.emptyForgotToken({ "token": payload.prm });
				// 			return Promise.reject(MESSAGES.ERROR.TOKEN_EXPIRED);
				// 		} else {
				// 			const responseHtml = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "deeplink.html"))
				// 				.compileFile({
				// 					url: params.android || "", // android scheme,
				// 					iosLink: params.ios || "", // ios scheme
				// 					fallback: params.fallback,
				// 					title: SERVER.APP_NAME,
				// 					android_package_name: "",
				// 					ios_store_link: ""
				// 				});

				// 			return responseHtml;
				// 		}
				// 	}
				// }
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function scriptForUsers
	 */
	async scriptForUsers() {
		try {
			let i = 0;
			const users = await baseDao.find("users", { "userType": USER_TYPE.SUPPORTER }, {}, {});

			for await (const user of users) {
				console.log(++i, "111111111111111111111111111111111111111111");
				if (user?.documents?.ndisPlan) {
					const update = {};
					update["$unset"] = { "documents.ndisPlan": "" };
					update["$set"] = { "documents.resume": user.documents.ndisPlan };
					await baseDao.updateOne("users", { "_id": user._id }, update, {});
				} else {
					await baseDao.updateOne("users", { "_id": user._id }, { "$unset": { "document.ndisPlan": "" } }, {});
				}
			}
			return {};
		} catch (error) {
			throw error;
		}
	}
}

export const commonController = new CommonController();