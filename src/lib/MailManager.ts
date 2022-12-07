"use strict";

import * as nodemailer from "nodemailer";

import { timeConversion } from "@utils/appUtils";
import { TEMPLATES, SERVER, USER_TYPE, TOKEN_TYPE, STATUS } from "@config/index";
import { TemplateUtil } from "@utils/TemplateUtil";
import { sendMessageToFlock } from "@utils/FlockUtils";
import { adminDaoV1 } from "@dao/index";
import { createToken } from "./tokenManager";
import * as promise from "bluebird";
import { commonController } from "@controllers/v1/CommonController";


// using smtp
const transporter = nodemailer.createTransport({
	host: SERVER.MAIL.SMTP.HOST,
	port: SERVER.MAIL.SMTP.PORT,
	secure: true, // use SSL
	//	requireTLS: true,
	auth: {
		user: SERVER.MAIL.SMTP.USER,
		pass: SERVER.MAIL.SMTP.PASSWORD
	}
});

export class MailManager {
	// private fromEmail: string = TEMPLATES.EMAIL.FROM_MAIL;
	private fromEmail: string = SERVER.MAIL.SMTP.USER;
	async sendMail(params) {
		const mailOptions = {
			from: `${SERVER.APP_NAME} <${this.fromEmail}>`, // sender email
			to: params.email, // list of receivers
			subject: params.subject, // Subject line
			html: params.content
		};

		return new Promise(function (resolve, reject) {
			return transporter.sendMail(mailOptions, function (error, info) {
				if (error) {
					console.error("sendMail==============>", error);
					sendMessageToFlock({ "title": "sendMail", "error": error });
					resolve(SERVER.ENVIRONMENT !== "production" ? true : false);
				} else {
					console.log("Message sent: " + info.response);
					resolve(true);
				}
			});
		});
	}

	async forgotPasswordMail(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "forgot-password.html"))
			.compileFile({
				"otp": params.otp,
				"name": params.name,
				"validity": timeConversion(SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL)
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.FORGOT_PASSWORD,
			"content": mailContent
		});
	}

	async adminForgotPasswordMail(params) {		
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "admin-forgot-password.html"))
			.compileFile({
				"url": `${SERVER.ADMIN_URL}`+`/account/reset-password?token=${params.accessToken}&email=${params.email}`,
				"firstname": params.firstname,
				"validity": timeConversion(SERVER.TOKEN_INFO.EXPIRATION_TIME.FORGOT_PASSWORD)
			});	

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.FORGOT_PASSWORD,
			"content": mailContent
		});
	}

	async adminResendEmail(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "admin-resend-email.html"))
		.compileFile({
			"url": `${SERVER.ADMIN_URL}`+`/account/reset-password?token=${params.accessToken}&email=${params.email}`,
			"firstname": params.firstname,
			"validity": timeConversion(SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL)
		});		

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.RESEND_EMAIL,
			"content": mailContent
		});
	}

	async resentOtp(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "resendOtp.html"))
			.compileFile({
				"otp": params.otp,
				"name": params.name,
				"validity": timeConversion(SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL)
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.RESEND_OTP,
			"content": mailContent
		});
	}

	async AddUserMail(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "add-user-welcome.html"))
			.compileFile({
				"name": params.name,
				"email": params.email,
				"password": params.password,
				"deeplink": params.deeplink,
				"validity": timeConversion(SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL)
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.WELCOME,
			"content": mailContent
		});
	}

	async AddAdminMail(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "add-admin-welcome.html"))
			.compileFile({
				"email": params.email,
				"password": params.password,
				"link": `${SERVER.ADMIN_URL}/account/login`,
				"validity": timeConversion(SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL)
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.WELCOME,
			"content": mailContent
		});
	}

	async verifyEmail(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "email-verification.html"))
			.compileFile({
				"otp": params.otp,
				"name": params.name,
				"validity": timeConversion(SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL)
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.VERIFY_OTP,
			"content": mailContent
		});
	}
	async composeMail(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "compose.html"))
			.compileFile({
				"message": params.message,
				"name": params.name,
				//"validity": timeConversion(SERVER.TOKEN_INFO.EXPIRATION_TIME.FORGOT_PASSWORD)
			});

		return await this.sendMail({
			"email": params.email,
			"subject": params.subject,
			"content": mailContent
		});
	}
	async incidenReportdMail(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "forgot-password.html"))
			.compileFile({
				"otp": params.otp,
				"name": params.name,
				"validity": timeConversion(SERVER.TOKEN_INFO.EXPIRATION_TIME.FORGOT_PASSWORD)
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.FORGOT_PASSWORD,
			"content": mailContent
		});
	}

	/**
	 * @function accountBlocked
	 * @description user account have been blocked
	 */
	async accountBlocked(payload) {
		let mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "account-blocked.html"))
			.compileFile({
				"name": payload?.name,
				"reason": payload.reason
			});

		return await this.sendMail({
			"email": payload.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.ACCOUNT_BLOCKED,
			"content": mailContent
		});
	}

	/**
	 * @function welcomeEmail
	 * @description send welcome email to user after profile completion
	 * @author Rajat Maheshwari
	 * @param params.email: user's email
	 * @param params.name: user's name
	 */
	async welcomeEmail(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "welcome-email.html"))
			.compileFile({
				"name": params.name
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.WELCOME,
			"content": mailContent
		});
	}

	/**
	 * @function accountBlocked
	 * @description user account have been rejected
	 */
	async verificationStatus(payload) {
		let mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "verification-process.html"))
			.compileFile({
				"name": payload?.name,
				"reason": payload.reason
			});

		return await this.sendMail({
			"email": payload.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.VERIFICATION_REJECTED,
			"content": mailContent
		});
	}

	// /**
	//  * @function emailVerification
	//  * @description send otp to user's email for verification on (signup)
	//  * @author Rajat Maheshwari
	//  * @param params.email: user's email
	//  * @param params.otp: otp
	//  */
	// async emailVerification(params) {
	// 	const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "email-verification.html"))
	// 		.compileFile({
	// 			"otp": params.otp,
	// 			"name": params.name,
	// 			"validity": timeConversion(SERVER.TOKEN_INFO.EXPIRATION_TIME.VERIFY_EMAIL)
	// 		});

	// 	return await this.sendMail({
	// 		"email": params.email,
	// 		"subject": TEMPLATES.EMAIL.SUBJECT.VERIFY_EMAIL,
	// 		"content": mailContent
	// 	});
	// }


	/**
	 * @function documentUploadLink
	 * @description send document upload link
	 * @author Rajat Maheshwari
	 * @param params.name: user's name
	 * @param params.email: user's email
	 * @param params.type: type
	 * @param params.displayName: name to be displayed on template
	 * @param params.token: unique token for document upload
	 */
	async documentUploadLink(params) {
		const mailContent = await (new TemplateUtil(SERVER.TEMPLATE_PATH + "document-link.html"))
			.compileFile({
				"url": `${SERVER.APP_URL}/deeplink?name=${params.name}&token=${params.token}&type=${params.type}`,
				"displayName": params.displayName,
				"name": params.name
			});

		return await this.sendMail({
			"email": params.email,
			"subject": TEMPLATES.EMAIL.SUBJECT.UPLOAD_DOCUMENT,
			"content": mailContent
		});
	}
}

export const mailManager = new MailManager();