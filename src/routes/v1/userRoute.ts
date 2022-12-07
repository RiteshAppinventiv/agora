"use strict";

import { Request, ResponseToolkit } from "@hapi/hapi";
import * as Joi from "joi";

import { failActionFunction } from "@utils/appUtils";
import {
	authorizationHeaderObj,
	headerObject
} from "@utils/validator";
import {
	GENDER,
	GRAPH_TYPE,
	FRIEND_REQUEST_STATUS,
	REGEX,
	PARTICIPANT_PROFILE_STEPS,
	STATUS,
	SUPPORTER_PROFILE_STEPS,
	SWAGGER_DEFAULT_RESPONSE_MESSAGES,
	USER_TYPE,
	VALIDATION_CRITERIA,
	VALIDATION_MESSAGE,
	SERVER
} from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { userControllerV1 } from "@controllers/index";

export const userRoute = [
	{
		method: "POST",
		path: `${SERVER.API_BASE_URL}/v1/user/signup`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const payload: UserRequest.SignUp = request.payload;
				const result = await userControllerV1.signUp(payload);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "User SignUp ",
			auth: {
				strategies: ["BasicAuth"]
			},
			validate: {
				headers: headerObject["required"],
				payload: Joi.object({
					email: Joi.string()
						.trim()
						.lowercase()
						.email({ minDomainSegments: 2 })
						// .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
						.regex(REGEX.EMAIL)
						.default("string@gmail.com")
						.required(),
					password: Joi.string()
						.trim()
						.regex(REGEX.PASSWORD)
						.min(VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
						.max(VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
						.default(SERVER.DEFAULT_PASSWORD)
						.required()
						.messages({
							"string.pattern.base": VALIDATION_MESSAGE.password.pattern,
							"string.min": VALIDATION_MESSAGE.password.minlength,
							"string.max": VALIDATION_MESSAGE.password.maxlength,
							"string.empty": VALIDATION_MESSAGE.password.required,
							"any.required": VALIDATION_MESSAGE.password.required
						}),
					firstName: Joi.string().trim().required(),
					lastName: Joi.string().trim().required(),
				}).label('Model-user-signup'),
				failAction: failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${SERVER.API_BASE_URL}/v1/user/send-otp`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const payload: UserRequest.SendOtp = request.payload;
				const result = await userControllerV1.sendOTP(payload);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "Send/Resend Otp On Email/mobile no",
			auth: {
				strategies: ["BasicAuth"]
			},
			validate: {
				headers: headerObject["required"],
				payload: Joi.object({
					type: Joi.string().trim().valid("EMAIL", "MOBILE").default("EMAIL").optional(),
					email: Joi.string()
						.trim()
						.lowercase()
						.email({ minDomainSegments: 2 })
						// .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
						.regex(REGEX.EMAIL)
						.required(),
					mobileNo: Joi.when("type", {
						is: Joi.valid("MOBILE"),
						then: Joi.string()
							.trim()
							//.regex(REGEX.MOBILE_NUMBER)
							.required()
							.messages({ "string.pattern.base": VALIDATION_MESSAGE.mobileNo.pattern }),
						otherwise: Joi.string()
							.trim()
							.regex(REGEX.MOBILE_NUMBER)
							.optional()
							.messages({ "string.pattern.base": VALIDATION_MESSAGE.mobileNo.pattern })
					})
				}).label('Model-user-send-otp'),
				failAction: failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${SERVER.API_BASE_URL}/v1/user/resend-otp`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const headers = request.headers;
				const payload: UserRequest.RESEND_OTP = request.payload;
				const result = await userControllerV1.resendOtp({ ...headers, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "user"],
			description: "resend Otp",
			auth: {
				strategies: ["BasicAuth"]
			},
			validate: {
				headers: headerObject["required"],
				payload: Joi.object({
					type: Joi.string().trim().valid("LOGIN", "SIGNUP", "FORGET-PASSWORD").default("SIGNUP").required(),
					email: Joi.string()
						.trim()
						.lowercase()
						.email({ minDomainSegments: 2 })
						// .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
						.regex(REGEX.EMAIL)
						.required()
				}).label('Model-user-resend-otp'),
				failAction: failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${SERVER.API_BASE_URL}/v1/user/verify-otp`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const headers = request.headers;
				const payload: UserRequest.VerifyOTP = request.payload;
				payload.remoteAddress = request["headers"]["x-forwarded-for"] || request.info.remoteAddress;
				const result = await userControllerV1.verifyOTP({ ...headers, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "user"],
			description: "Verify Email",
			auth: {
				strategies: ["BasicAuth"]
			},
			validate: {
				headers: headerObject["required"],
				payload: Joi.object({
					type: Joi.string().trim().valid("LOGIN", "SIGNUP", "FORGET-PASSWORD").default("SIGNUP").required(),
					userType: Joi.string().trim().valid("USER", "ADMIN").default("USER").required(),
					email: Joi.string()
						.trim()
						.lowercase()
						.email({ minDomainSegments: 2 })
						// .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
						.regex(REGEX.EMAIL)
						.required(),
					otp: Joi.string().default(SERVER.DEFAULT_OTP).required(),
					// mobileNo: Joi.when("type", {
					// 	is: Joi.valid("MOBILE"),
					// 	then: Joi.string()
					// 		.trim()
					// 		.regex(REGEX.MOBILE_NUMBER)
					// 		.required()
					// 		.messages({ "string.pattern.base": VALIDATION_MESSAGE.mobileNo.pattern }),
					// 	otherwise: Joi.string()
					// 		.trim()
					// 		.regex(REGEX.MOBILE_NUMBER)
					// 		.optional()
					// 		.messages({ "string.pattern.base": VALIDATION_MESSAGE.mobileNo.pattern })
					// }),
					deviceId: Joi.when("type", {
						is: Joi.valid("MOBILE"),
						then: Joi.string().trim().required(),
						otherwise: Joi.string().trim().optional()
					}),
					deviceToken: Joi.when("type", {
						is: Joi.valid("MOBILE"),
						then: Joi.string().trim().required(),
						otherwise: Joi.string().trim().optional()
					}).label('Model-user-verify-otp'),
				}).label('Model-user-verify-otp'),
				failAction: failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${SERVER.API_BASE_URL}/v1/user/login`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const headers = request.headers;
				const payload: UserRequest.Login = request.payload;
				payload.remoteAddress = request["headers"]["x-forwarded-for"] || request.info.remoteAddress;
				const result = await userControllerV1.login({ ...headers, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "User Login",
			notes: "User login via email & password",
			auth: {
				strategies: ["BasicAuth"]
			},
			validate: {
				headers: headerObject["required"],
				payload: Joi.object({
					email: Joi.string()
						.trim()
						.lowercase()
						.email({ minDomainSegments: 2 })
						// .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
						.regex(REGEX.EMAIL)
						.required(),
					password: Joi.string()
						.trim()
						.default(SERVER.DEFAULT_PASSWORD)
						.required(),
					deviceId: Joi.string().trim().required(),
					deviceToken: Joi.string().trim().required()
				}).label('Model-user-login'),
				failAction: failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "POST",
		path: `${SERVER.API_BASE_URL}/v1/user/forgot-password`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const headers = request.headers;
				const payload: UserRequest.ForgotPassword = request.payload;
				const result = await userControllerV1.forgotPassword({ ...headers, ...payload });
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		// config: {
		// 	tags: ["api", "user"],
		// 	description: "Forgot Password",
		// 	auth: {
		// 		strategies: ["BasicAuth"]
		// 	},
		// 	validate: {
		// 		headers: headerObject["required"],
		// 		payload: Joi.object({
		// 			email: Joi.string()
		// 				.trim()
		// 				.lowercase()
		// 				.email({ minDomainSegments: 2 })
		// 				// .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
		// 				.regex(REGEX.EMAIL)
		// 				.required()
		// 		}),
		// 		failAction: failActionFunction
		// 	},
		// 	plugins: {
		// 		"hapi-swagger": {
		// 			responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
		// 		}
		// 	}
		// }
	},
	{
		method: "POST",
		path: `${SERVER.API_BASE_URL}/v1/user/reset-password`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const payload: UserRequest.ChangeForgotPassword = request.payload;
				const result = await userControllerV1.resetPassword(payload);
				console.log(result, 'resultsststs')
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		// config: {
		// 	tags: ["api", "user"],
		// 	description: "Reset Password After forgot password and verify OTP",
		// 	auth: {
		// 		strategies: ["BasicAuth"]
		// 	},
		// 	validate: {
		// 		headers: headerObject["required"],
		// 		payload: Joi.object({
		// 			email: Joi.string()
		// 				.trim()
		// 				.lowercase()
		// 				.email({ minDomainSegments: 2 })
		// 				// .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
		// 				.regex(REGEX.EMAIL)
		// 				.required(),
		// 			newPassword: Joi.string()
		// 				.trim()
		// 				.regex(REGEX.PASSWORD)
		// 				.min(VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
		// 				.max(VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
		// 				.default(SERVER.DEFAULT_PASSWORD)
		// 				.required()
		// 				.messages({
		// 					"string.pattern.base": VALIDATION_MESSAGE.password.pattern,
		// 					"string.min": VALIDATION_MESSAGE.password.minlength,
		// 					"string.max": VALIDATION_MESSAGE.password.maxlength,
		// 					"string.empty": VALIDATION_MESSAGE.password.required,
		// 					"any.required": VALIDATION_MESSAGE.password.required
		// 				}),
		// 			confirmPassword: Joi.string()
		// 				.trim()
		// 				.regex(REGEX.PASSWORD)
		// 				.min(VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
		// 				.max(VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
		// 				.default(SERVER.DEFAULT_PASSWORD)
		// 				.required()
		// 				.messages({
		// 					"string.pattern.base": VALIDATION_MESSAGE.password.pattern,
		// 					"string.min": VALIDATION_MESSAGE.password.minlength,
		// 					"string.max": VALIDATION_MESSAGE.password.maxlength,
		// 					"string.empty": VALIDATION_MESSAGE.password.required,
		// 					"any.required": VALIDATION_MESSAGE.password.required
		// 				})
		// 		}),
		// 		failAction: failActionFunction
		// 	},
		// 	plugins: {
		// 		"hapi-swagger": {
		// 			responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
		// 		}
		// 	}
		// }
	},
	{
		method: "POST",
		path: `${SERVER.API_BASE_URL}/v1/user/logout`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
				const result = await userControllerV1.logout(tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "User Logout",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				failAction: failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "GET",
		path: `${SERVER.API_BASE_URL}/v1/user/profile`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const query: UserId = request.query;
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
				const result = await userControllerV1.profile(query, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		// options: {
		// 	tags: ["api", "user"],
		// 	description: "User Profile",
		// 	notes: "for Admin/User",
		// 	auth: {
		// 		strategies: ["CommonAuth"]
		// 	},
		// 	validate: {
		// 		headers: authorizationHeaderObj,
		// 		query: Joi.object({
		// 			userId: Joi.string().trim().regex(REGEX.MONGO_ID).optional()
		// 		}),
		// 		failAction: failActionFunction
		// 	},
		// 	plugins: {
		// 		"hapi-swagger": {
		// 			responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
		// 		}
		// 	}
		// }
	},

	{
		method: "POST",
		path: `${SERVER.API_BASE_URL}/v1/user/agoraToken`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const payload: UserRequest.AgoraToken = request.payload;
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
				h.response().header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
				h.response().header('Expires', '-1');
				h.response().header('Pragma', 'no-cache');
				const result = await userControllerV1.generateAgoraToken(payload, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "Generate agora token",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				payload: Joi.object({
					account: Joi.string().optional(),
					role: Joi.boolean().optional(),
					uid: Joi.number().optional(),
					agoraChannelName: Joi.string().optional(),
					expirationTimeInSeconds: Joi.number().optional()
				}).label('Model-agoraToken-Generate'),
				failAction: failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},

	{
		method: "POST",
		path: `${SERVER.API_BASE_URL}/v1/user/call-notification`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const payload: UserRequest.CallNotification = request.payload;
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
				const result = await userControllerV1.callNotification(payload, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "send call notification to receiverId",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				payload: Joi.object({
					account: Joi.string().optional(),
					role: Joi.boolean().optional(),
					tokenId: Joi.string().optional(),
					uid: Joi.string().optional(),
					agoraChannelName: Joi.string().optional(),
					expirationTimeInSeconds: Joi.number().optional(),
					subscriberId: Joi.string().regex(REGEX.MONGO_ID).required(),
					isAudio: Joi.string().optional().default("Yes").valid("Yes", "No")
				}),
				failAction: failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},

	{
		method: "POST",
		path: `${SERVER.API_BASE_URL}/v1/user/decline-call-notification`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const payload: UserRequest.DeclineCallNotification = request.payload;
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
				const result = await userControllerV1.declineCallNotification(payload, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		options: {
			tags: ["api", "user"],
			description: "call declining notification to publisherId",
			auth: {
				strategies: ["UserAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				payload: Joi.object({
					publisherId: Joi.string().regex(REGEX.MONGO_ID).required()
				}),
				failAction: failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	// {
	// 	method: "GET",
	// 	path: `${SERVER.API_BASE_URL}/v1/user/chat-user-list`,
	// 	handler: async (request: Request | any, h: ResponseToolkit) => {
	// 		try {
	// 			const query: UserId = request.query;
	// 			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
	// 			const result = await userControllerV1.chatUserList(query, tokenData);
	// 			return responseHandler.sendSuccess(h, result);
	// 		} catch (error) {
	// 			return responseHandler.sendError(request, error);
	// 		}
	// 	},
	// 	options: {
	// 		tags: ["api", "user"],
	// 		description: "Chat user list",
	// 		notes: "for Admin/User",
	// 		auth: {
	// 			strategies: ["CommonAuth"]
	// 		},
	// 		validate: {
	// 			headers: authorizationHeaderObj,
	// 			query: Joi.object({
	// 				userId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(),
	// 				searchKey: Joi.string().optional().description("Search by name"),

	// 			}),
	// 			failAction: failActionFunction
	// 		},
	// 		plugins: {
	// 			"hapi-swagger": {
	// 				responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
	// 			}
	// 		}
	// 	}
	// },

	// {
	// 	method: "PUT",
	// 	path: `${SERVER.API_BASE_URL}/v1/user/block-unblock`,
	// 	handler: async (request: Request | any, h: ResponseToolkit) => {
	// 		try {
	// 			const payload: BlockRequest = request.payload;
	// 			const result = await userControllerV1.blockUnblockUser(payload);
	// 			return responseHandler.sendSuccess(h, result);
	// 		} catch (error) {
	// 			return responseHandler.sendError(request, error);
	// 		}
	// 	},
	// 	options: {
	// 		tags: ["api", "user"],
	// 		description: "Block User",
	// 		notes: "Block/Unblock User",
	// 		auth: {
	// 			strategies: ["AdminAuth"]
	// 		},
	// 		validate: {
	// 			headers: authorizationHeaderObj,
	// 			payload: Joi.object({
	// 				userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
	// 				status: Joi.string()
	// 					.trim()
	// 					.required()
	// 					.valid(STATUS.BLOCKED, STATUS.UN_BLOCKED),
	// 				reason: Joi.when("status", {
	// 					is: Joi.valid(STATUS.BLOCKED),
	// 					then: Joi.string().trim().required(),
	// 					otherwise: Joi.string().trim().optional()
	// 				})
	// 			}),
	// 			failAction: failActionFunction
	// 		},
	// 		plugins: {
	// 			"hapi-swagger": {
	// 				responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
	// 			}
	// 		}
	// 	}
	// },
	// {
	// 	method: "PUT",
	// 	path: `${SERVER.API_BASE_URL}/v1/user/approved-declined`,
	// 	handler: async (request: Request | any, h: ResponseToolkit) => {
	// 		try {
	// 			const payload: UserRequest.VerifyUser = request.payload;
	// 			const result = await userControllerV1.verifyUser(payload);
	// 			return responseHandler.sendSuccess(h, result);
	// 		} catch (error) {
	// 			return responseHandler.sendError(request, error);
	// 		}
	// 	},
	// 	options: {
	// 		tags: ["api", "user"],
	// 		description: "Approved/Declined User",
	// 		notes: "Verification of User's Document by Admin",
	// 		auth: {
	// 			strategies: ["AdminAuth"]
	// 		},
	// 		validate: {
	// 			headers: authorizationHeaderObj,
	// 			payload: Joi.object({
	// 				userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
	// 				isApproved: Joi.boolean().required(),
	// 				reason: Joi.when("isApproved", {
	// 					is: Joi.valid(false),
	// 					then: Joi.string().trim().required(),
	// 					otherwise: Joi.string().trim().optional()
	// 				})
	// 			}),
	// 			failAction: failActionFunction
	// 		},
	// 		plugins: {
	// 			"hapi-swagger": {
	// 				responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
	// 			}
	// 		}
	// 	}
	// },

	// {
	// 	method: "PUT",
	// 	path: `${SERVER.API_BASE_URL}/v1/user/photo`,
	// 	handler: async (request: Request | any, h: ResponseToolkit) => {
	// 		try {
	// 			const payload: UserRequest.EditProfilePic = request.payload;
	// 			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
	// 			const result = await userControllerV1.editProfilePic(payload, tokenData);
	// 			return responseHandler.sendSuccess(h, result);
	// 		} catch (error) {
	// 			return responseHandler.sendError(request, error);
	// 		}
	// 	},
	// 	options: {
	// 		tags: ["api", "user"],
	// 		description: "Add your photo (Step 3)",
	// 		notes: "for Participant/Supporter",
	// 		auth: {
	// 			strategies: ["UserAuth"]
	// 		},
	// 		validate: {
	// 			headers: authorizationHeaderObj,
	// 			payload: Joi.object({
	// 				profilePicture: Joi.string().trim().required()
	// 			}),
	// 			failAction: failActionFunction
	// 		},
	// 		plugins: {
	// 			"hapi-swagger": {
	// 				responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
	// 			}
	// 		}
	// 	}
	// },

	// {
	// 	method: "POST",
	// 	path: `${SERVER.API_BASE_URL}/v1/user/manage-notification`,
	// 	handler: async (request: Request | any, h: ResponseToolkit) => {
	// 		try {
	// 			const payload: UserRequest.ManageNotification = request.payload;
	// 			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
	// 			const result = await userControllerV1.manageNotification(payload, tokenData);
	// 			return responseHandler.sendSuccess(h, result);
	// 		} catch (error) {
	// 			return responseHandler.sendError(request, error);
	// 		}
	// 	},
	// 	options: {
	// 		tags: ["api", "user"],
	// 		description: "Manage Notifications",
	// 		auth: {
	// 			strategies: ["UserAuth"]
	// 		},
	// 		validate: {
	// 			headers: authorizationHeaderObj,
	// 			payload: Joi.object().keys({
	// 				pushNotificationStatus: Joi.boolean().optional(),
	// 				groupaNotificationStatus: Joi.boolean().optional()
	// 			}).or("pushNotificationStatus", "groupaNotificationStatus"),
	// 			failAction: failActionFunction
	// 		},
	// 		plugins: {
	// 			"hapi-swagger": {
	// 				responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
	// 			}
	// 		}
	// 	}
	// },
	// {
	// 	method: "POST",
	// 	path: `${SERVER.API_BASE_URL}/v1/user/notification-status`,
	// 	handler: async (request: Request | any, h: ResponseToolkit) => {
	// 		try {
	// 			const payload: UserRequest.NotificationStatus = request.payload;
	// 			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
	// 			const result = await userControllerV1.notificationStatus(payload, tokenData);
	// 			return responseHandler.sendSuccess(h, result);
	// 		} catch (error) {
	// 			return responseHandler.sendError(request, error);
	// 		}
	// 	},
	// 	options: {
	// 		tags: ["api", "user"],
	// 		description: "Manage Notifications",
	// 		auth: {
	// 			strategies: ["UserAuth"]
	// 		},
	// 		validate: {
	// 			headers: authorizationHeaderObj,
	// 			payload: Joi.object({
	// 				isRead: Joi.boolean().required(),
	// 				notificationId: Joi.string().trim().regex(REGEX.MONGO_ID).required()
	// 			}),
	// 			failAction: failActionFunction
	// 		},
	// 		plugins: {
	// 			"hapi-swagger": {
	// 				responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
	// 			}
	// 		}
	// 	}
	// },
	// {
	// 	method: "GET",
	// 	path: `${SERVER.API_BASE_URL}/v1/user/notification`,
	// 	handler: async (request: Request | any, h: ResponseToolkit) => {
	// 		try {
	// 			const query: UserRequest.NotificationList = request.query;
	// 			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
	// 			const result = await userControllerV1.NotificationList(query, tokenData);
	// 			return responseHandler.sendSuccess(h, result);
	// 		} catch (error) {
	// 			return responseHandler.sendError(request, error);
	// 		}
	// 	},
	// 	config: {
	// 		tags: ["api", "user"],
	// 		description: " User Notification List",
	// 		notes: "for Participant/Supporter",
	// 		auth: {
	// 			strategies: ["UserAuth"]
	// 		},
	// 		validate: {
	// 			headers: authorizationHeaderObj,
	// 			query: Joi.object({
	// 				pageNo: Joi.number().required().description("Page no"),
	// 				limit: Joi.number().required().description("limit"),
	// 			}),
	// 			failAction: failActionFunction
	// 		},
	// 		plugins: {
	// 			"hapi-swagger": {
	// 				responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
	// 			}
	// 		}
	// 	}
	// },

	// {
	// 	method: "PUT",
	// 	path: `${SERVER.API_BASE_URL}/v1/user/settings`,
	// 	handler: async (request: Request | any, h: ResponseToolkit) => {
	// 		try {
	// 			const payload: UserRequest.Setting = request.payload;
	// 			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
	// 			const result = await userControllerV1.editSetting(payload, tokenData);
	// 			return responseHandler.sendSuccess(h, result);
	// 		} catch (error) {
	// 			return responseHandler.sendError(request, error);
	// 		}
	// 	},
	// 	options: {
	// 		tags: ["api", "user"],
	// 		description: "user setting update",
	// 		notes: "for Participant/Supporter",
	// 		auth: {
	// 			strategies: ["UserAuth"]
	// 		},
	// 		validate: {
	// 			headers: authorizationHeaderObj,
	// 			payload: Joi.object({
	// 				pushNotificationStatus: Joi.boolean().required(),
	// 				groupaNotificationStatus: Joi.boolean().required(),
	// 				isProfileHidden: Joi.boolean().required(),
	// 				fontsContrast: Joi.boolean().optional(),
	// 				fontSize: Joi.number().valid(0, 1, 2).required()

	// 			}),
	// 			failAction: failActionFunction
	// 		},
	// 		plugins: {
	// 			"hapi-swagger": {
	// 				responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
	// 			}
	// 		}
	// 	}
	// },



];