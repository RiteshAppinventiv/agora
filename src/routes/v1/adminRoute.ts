// "use strict";

// import { Request, ResponseToolkit } from "@hapi/hapi";
// import * as Joi from "joi";

// import { adminControllerV1, userControllerV1 } from "@controllers/index";
// import { adminDaoV1 } from "@dao/index";
// import { failActionFunction } from "@utils/appUtils";
// import { authorizationHeaderObj, headerObject } from "@utils/validator";
// import { validateAdmin } from "@lib/tokenManager";
// import {
// 	REGEX,
// 	SWAGGER_DEFAULT_RESPONSE_MESSAGES,
// 	STATUS,
// 	USER_TYPE,
// 	VALIDATION_CRITERIA,
// 	VALIDATION_MESSAGE,
// 	SERVER,
// 	DEVICE_TYPE
// } from "@config/index";
// import { responseHandler } from "@utils/ResponseHandler";
// import { adminController } from "@controllers/v1/AdminController";

// // export const adminRoute: ServerRoute[] = [   
// export const adminRoute = [
// 	{
// 		method: "POST",
// 		path: `${SERVER.API_BASE_URL}/v1/admin/login`,
// 		handler: async (request: Request | any, h: ResponseToolkit) => {
// 			try {
// 				const headers = request.headers;
// 				const payload: AdminRequest.Login = request.payload;
// 				payload.remoteAddress = request["headers"]["x-forwarded-for"] || request.info.remoteAddress;
// 				const result = await adminControllerV1.login({ ...headers, ...payload });
// 				return responseHandler.sendSuccess(h, result);
// 			} catch (error) {
// 				return responseHandler.sendError(request, error);
// 			}
// 		},
// 		config: {
// 			tags: ["api", "admin"],
// 			description: "Admin Login",
// 			auth: {
// 				strategies: ["BasicAuth"]
// 			},
// 			validate: {
// 				headers: headerObject["required"],
// 				payload: Joi.object({
// 					email: Joi.string()
// 						.trim()
// 						.lowercase()
// 						.email({ minDomainSegments: 2 })
// 						// .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
// 						.regex(REGEX.EMAIL)
// 						.required(),
// 					password: Joi.string()
// 						.trim()
// 						.regex(REGEX.PASSWORD)
// 						.min(VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
// 						.max(VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
// 						.default(SERVER.DEFAULT_PASSWORD)
// 						.required()
// 						.messages({
// 							"string.pattern.base": VALIDATION_MESSAGE.password.pattern,
// 							"string.min": VALIDATION_MESSAGE.password.minlength,
// 							"string.max": VALIDATION_MESSAGE.password.maxlength,
// 							"string.empty": VALIDATION_MESSAGE.password.required,
// 							"any.required": VALIDATION_MESSAGE.password.required
// 						}),
// 					deviceId: Joi.string().trim().required(),
// 					platform: Joi.string().required().valid(DEVICE_TYPE.WEB),
// 					deviceToken: Joi.string().optional()
// 				}),
// 				failAction: failActionFunction
// 			},
// 			plugins: {
// 				"hapi-swagger": {
// 					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
// 				}
// 			}
// 		}
// 	},
// 	{
// 		method: "POST",
// 		path: `${SERVER.API_BASE_URL}/v1/admin/logout`,
// 		handler: async (request: Request | any, h: ResponseToolkit) => {
// 			try {
// 				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
// 				const result = await adminControllerV1.logout(tokenData);
// 				return responseHandler.sendSuccess(h, result);
// 			} catch (error) {
// 				return responseHandler.sendError(request, error);
// 			}
// 		},
// 		config: {
// 			tags: ["api", "admin"],
// 			description: "Logout",
// 			auth: {
// 				strategies: ["AdminAuth"]
// 			},
// 			validate: {
// 				headers: authorizationHeaderObj,
// 				failAction: failActionFunction
// 			},
// 			plugins: {
// 				"hapi-swagger": {
// 					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
// 				}
// 			}
// 		}
// 	},
// 	{
// 		method: "POST",
// 		path: `${SERVER.API_BASE_URL}/v1/admin/forgot-password`,
// 		handler: async (request: Request | any, h: ResponseToolkit) => {
// 			try {
// 				const payload: AdminRequest.ForgotPasswordRequest = request.payload;
// 				const result = await adminControllerV1.forgotPassword(payload);
// 				return responseHandler.sendSuccess(h, result);
// 			} catch (error) {
// 				return responseHandler.sendError(request, error);
// 			}
// 		},
// 		config: {
// 			tags: ["api", "admin"],
// 			description: "Forgot Password",
// 			auth: {
// 				strategies: ["BasicAuth"]
// 			},
// 			validate: {
// 				headers: headerObject["required"],
// 				payload: Joi.object({
// 					email: Joi.string()
// 						.trim()
// 						.lowercase()
// 						.email({ minDomainSegments: 2 })
// 						// .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
// 						.regex(REGEX.EMAIL)
// 						.required()
// 						.messages({
// 							"string.pattern.base": VALIDATION_MESSAGE.email.pattern
// 						})
// 				}),
// 				failAction: failActionFunction
// 			},
// 			plugins: {
// 				"hapi-swagger": {
// 					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
// 				}
// 			}
// 		}
// 	},
// 	{
// 		method: "POST",
// 		path: `${SERVER.API_BASE_URL}/v1/admin/verify-otp`,
// 		handler: async (request: Request | any, h: ResponseToolkit) => {
// 			try {
// 				const payload: VerifyOTP = request.payload;
// 				const result = await adminControllerV1.verifyOTP(payload);
// 				return responseHandler.sendSuccess(h, result);
// 			} catch (error) {
// 				return responseHandler.sendError(request, error);
// 			}
// 		},
// 		config: {
// 			tags: ["api", "admin"],
// 			description: "Verify OTP on Forgot Password",
// 			auth: {
// 				strategies: ["BasicAuth"]
// 			},
// 			validate: {
// 				headers: headerObject["required"],
// 				payload: Joi.object({
// 					email: Joi.string()
// 						.trim()
// 						.lowercase()
// 						.email({ minDomainSegments: 2 })
// 						// .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
// 						.regex(REGEX.EMAIL)
// 						.required(),
// 					otp: Joi.string().default(SERVER.DEFAULT_OTP).required()
// 				}),
// 				failAction: failActionFunction
// 			},
// 			plugins: {
// 				"hapi-swagger": {
// 					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
// 				}
// 			}
// 		}
// 	},
// 	{
// 		method: "POST",
// 		path: `${SERVER.API_BASE_URL}/v1/admin/reset-password`,
// 		handler: async (request: Request | any, h: ResponseToolkit) => {
// 			try {
// 				const payload: AdminRequest.ChangeForgotPassword = request.payload;
// 				const tokenData = await validateAdmin(payload.token, request)
// 				const result = await adminControllerV1.resetPassword(payload, tokenData);
// 				return responseHandler.sendSuccess(h, result);
// 			} catch (error) {
// 				await adminDaoV1.emptyForgotToken({});
// 				return responseHandler.sendError(request, error);
// 			}
// 		},
// 		config: {
// 			tags: ["api", "admin"],
// 			description: "Reset Password After forgot password and verify OTP",
// 			auth: {
// 				strategies: ["BasicAuth"]
// 			},
// 			validate: {
// 				headers: headerObject["required"],
// 				payload: Joi.object({
// 					token: Joi.string()

// 						.required(),
// 					password: Joi.string()
// 						.trim()
// 						.regex(REGEX.PASSWORD)
// 						.min(VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
// 						.max(VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
// 						.default(SERVER.DEFAULT_PASSWORD)
// 						.required()
// 						.messages({
// 							"string.pattern.base": VALIDATION_MESSAGE.password.pattern,
// 							"string.min": VALIDATION_MESSAGE.password.minlength,
// 							"string.max": VALIDATION_MESSAGE.password.maxlength,
// 							"string.empty": VALIDATION_MESSAGE.password.required,
// 							"any.required": VALIDATION_MESSAGE.password.required
// 						})
// 				}),
// 				failAction: failActionFunction
// 			},
// 			plugins: {
// 				"hapi-swagger": {
// 					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
// 				}
// 			}
// 		}
// 	},
// 	{
// 		method: "POST",
// 		path: `${SERVER.API_BASE_URL}/v1/admin/change-password`,
// 		handler: async (request: Request | any, h: ResponseToolkit) => {
// 			try {
// 				const payload: ChangePasswordRequest = request.payload;
// 				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;

// 				const result = await adminControllerV1.changePassword(payload, tokenData);
// 				return responseHandler.sendSuccess(h, result);
// 			} catch (error) {
// 				return responseHandler.sendError(request, error);
// 			}
// 		},
// 		config: {
// 			tags: ["api", "admin"],
// 			description: "Change Password",
// 			auth: {
// 				strategies: ["AdminAuth"]
// 			},
// 			validate: {
// 				headers: authorizationHeaderObj,
// 				payload: Joi.object({
// 					oldPassword: Joi.string()
// 						.trim()
// 						.min(VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
// 						.max(VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
// 						.default(SERVER.DEFAULT_PASSWORD)
// 						.required(),
// 					password: Joi.string()
// 						.trim()
// 						.regex(REGEX.PASSWORD)
// 						.min(VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH)
// 						.max(VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH)
// 						.default(SERVER.DEFAULT_PASSWORD)
// 						.required()
// 						.messages({
// 							"string.pattern.base": VALIDATION_MESSAGE.password.pattern,
// 							"string.min": VALIDATION_MESSAGE.password.minlength,
// 							"string.max": VALIDATION_MESSAGE.password.maxlength,
// 							"string.empty": VALIDATION_MESSAGE.password.required,
// 							"any.required": VALIDATION_MESSAGE.password.required
// 						})
// 				}),
// 				failAction: failActionFunction
// 			},
// 			plugins: {
// 				"hapi-swagger": {
// 					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
// 				}
// 			}
// 		}
// 	},
// 	{
// 		method: "GET",
// 		path: `${SERVER.API_BASE_URL}/v1/admin/profile`,
// 		handler: async (request: Request | any, h: ResponseToolkit) => {
// 			try {
// 				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
// 				const result = await adminControllerV1.adminDetails(tokenData);
// 				return responseHandler.sendSuccess(h, result);
// 			} catch (error) {
// 				return responseHandler.sendError(request, error);
// 			}
// 		},
// 		config: {
// 			tags: ["api", "admin"],
// 			description: "Admin Details",
// 			auth: {
// 				strategies: ["AdminAuth"]
// 			},
// 			validate: {
// 				headers: authorizationHeaderObj,
// 				failAction: failActionFunction
// 			},
// 			plugins: {
// 				"hapi-swagger": {
// 					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
// 				}
// 			}
// 		}
// 	},
// 	{
// 		method: "PUT",
// 		path: `${SERVER.API_BASE_URL}/v1/admin/profile`,
// 		handler: async (request: Request | any, h: ResponseToolkit) => {
// 			try {
// 				const payload: AdminRequest.EditProfile = request.payload;
// 				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
// 				const result = await adminControllerV1.editProfile(payload, tokenData);
// 				return responseHandler.sendSuccess(h, result);
// 			} catch (error) {
// 				return responseHandler.sendError(request, error);
// 			}
// 		},
// 		config: {
// 			tags: ["api", "admin"],
// 			description: "Edit Profile",
// 			auth: {
// 				strategies: ["AdminAuth"]
// 			},
// 			validate: {
// 				headers: authorizationHeaderObj,
// 				payload: Joi.object({
// 					profilePicture: Joi.string().trim().optional(),
// 					name: Joi.string()
// 						.trim()
// 						.min(VALIDATION_CRITERIA.NAME_MIN_LENGTH)
// 						.required(),
// 					email: Joi.string()
// 						.trim()
// 						.lowercase()
// 						.email({ minDomainSegments: 2 })
// 						// .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
// 						.regex(REGEX.EMAIL)
// 						.required()
// 				}),
// 				failAction: failActionFunction
// 			},
// 			plugins: {
// 				"hapi-swagger": {
// 					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
// 				}
// 			}
// 		}
// 	},
// 	{
// 		method: "GET",
// 		path: `${SERVER.API_BASE_URL}/v1/admin/dashboard`,
// 		handler: async (request: Request | any, h: ResponseToolkit) => {
// 			try {
// 				const query: AdminRequest.Dashboard = request.query;
// 				const result = await adminControllerV1.dashboard(query);
// 				return responseHandler.sendSuccess(h, result);
// 			} catch (error) {
// 				return responseHandler.sendError(request, error);
// 			}
// 		},
// 		config: {
// 			tags: ["api", "admin"],
// 			description: "Dashboard",
// 			auth: {
// 				strategies: ["AdminAuth"]
// 			},
// 			validate: {
// 				headers: authorizationHeaderObj,
// 				query: Joi.object({
// 					fromDate: Joi.number().optional().description("in timestamp"),
// 					toDate: Joi.number().optional().description("in timestamp")
// 				}),
// 				failAction: failActionFunction
// 			},
// 			plugins: {
// 				"hapi-swagger": {
// 					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
// 				}
// 			}
// 		}
// 	},
// 	{
// 		method: "GET",
// 		path: `${SERVER.API_BASE_URL}/v1/admin/user-list`,
// 		handler: async (request: Request | any, h: ResponseToolkit) => {
// 			try {
// 				const query: AdminRequest.UserListing = request.query;
// 				const result = await adminControllerV1.userList(query);
// 				return responseHandler.sendSuccess(h, result);
// 			} catch (error) {
// 				return responseHandler.sendError(request, error);
// 			}
// 		},
// 		config: {
// 			tags: ["api", "admin"],
// 			description: "User List",
// 			auth: {
// 				strategies: ["AdminAuth"]
// 			},
// 			validate: {
// 				headers: authorizationHeaderObj,
// 				query: Joi.object({
// 					pageNo: Joi.number().required().description("Page no"),
// 					limit: Joi.number().required().description("limit"),
// 					searchKey: Joi.string().optional().description("Search by name, email, ndisNumber"),
// 					sortBy: Joi.string().trim().valid("name", "created").optional().description("name, created"),
// 					sortOrder: Joi.number().optional().valid(1, -1).description("1 for asc, -1 for desc"),
// 					status: Joi.string()
// 						.trim()
// 						.optional()
// 						.valid(STATUS.BLOCKED, STATUS.UN_BLOCKED),
// 					fromDate: Joi.number().optional().description("in timestamp"),
// 					toDate: Joi.number().optional().description("in timestamp"),
// 					userType: Joi.string()
// 						.trim()
// 						.optional()
// 						.valid(USER_TYPE.PARTICIPANT, USER_TYPE.SUPPORTER),
// 					latestUsers: Joi.boolean().required()
// 				}),
// 				failAction: failActionFunction
// 			},
// 			plugins: {
// 				"hapi-swagger": {
// 					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
// 				}
// 			}
// 		}
// 	},

// 	{
// 		method: "GET",
// 		path: `${SERVER.API_BASE_URL}/v1/admin/notification`,
// 		handler: async (request: Request | any, h: ResponseToolkit) => {
// 			try {
// 				const query: UserRequest.NotificationList = request.query;
// 				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
// 				const result = await userControllerV1.AdminNotificationList(query, tokenData);
// 				return responseHandler.sendSuccess(h, result);
// 			} catch (error) {
// 				return responseHandler.sendError(request, error);
// 			}
// 		},
// 		config: {
// 			tags: ["api", "user"],
// 			description: " User Notification List",
// 			notes: "for Participant/Supporter",
// 			auth: {
// 				strategies: ["AdminAuth"]
// 			},
// 			validate: {
// 				headers: authorizationHeaderObj,
// 				query: Joi.object({
// 					pageNo: Joi.number().required().description("Page no"),
// 					limit: Joi.number().required().description("limit"),
// 				}),
// 				failAction: failActionFunction
// 			},
// 			plugins: {
// 				"hapi-swagger": {
// 					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
// 				}
// 			}
// 		}
// 	},

// 	{
// 		method: "GET",
// 		path: `${SERVER.API_BASE_URL}/v1/admin/timesheet-history`,
// 		handler: async (request: Request | any, h: ResponseToolkit) => {
// 			try {
// 				const query: UserRequest.TimeSHeetHistory = request.query;
// 				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
// 				const result = await adminController.timeSheetHistory(query, tokenData);
// 				return responseHandler.sendSuccess(h, result);
// 			} catch (error) {
// 				return responseHandler.sendError(request, error);
// 			}
// 		},
// 		config: {
// 			tags: ["api", "user"],
// 			description: " timesheet-history List",
// 			notes: "for Participant/Supporter",
// 			auth: {
// 				strategies: ["AdminAuth"],
// 				//strategies: ["UserAuth"]
// 			},
// 			validate: {
// 				headers: authorizationHeaderObj,
// 				query: Joi.object({
// 					pageNo: Joi.number().required().description("Page no"),
// 					limit: Joi.number().required().description("limit"),
// 					userId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
// 					type: Joi.string().valid(STATUS.UPCOMING, STATUS.ONGOING, "ALL")
// 				}),
// 				failAction: failActionFunction
// 			},
// 			plugins: {
// 				"hapi-swagger": {
// 					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
// 				}
// 			}
// 		}
// 	},




// 	{
// 		method: "POST",
// 		path: `${SERVER.API_BASE_URL}/v1/admin/compose-mail`,
// 		handler: async (request: Request | any, h: ResponseToolkit) => {
// 			try {
// 				const payload: ComposeMail = request.payload;
// 				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
// 				const result = await adminControllerV1.composeMail(payload, tokenData);
// 				return responseHandler.sendSuccess(h, result);
// 			} catch (error) {
// 				return responseHandler.sendError(request, error);
// 			}
// 		},
// 		config: {
// 			tags: ["api", "admin"],
// 			description: "Compose mail",
// 			auth: {
// 				strategies: ["AdminAuth"]
// 			},
// 			validate: {
// 				headers: authorizationHeaderObj,
// 				payload: Joi.object({
// 					email: Joi.string()
// 						.trim()
// 						.lowercase()
// 						//.email({ minDomainSegments: 2 })
// 						// .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } })
// 						//.regex(REGEX.EMAIL)
// 						.required(),
// 					subject: Joi.string()
// 						.trim().required(),
// 					name: Joi.string()
// 						.trim()
// 						.optional(),
// 					message: Joi.string()
// 						.trim()

// 						.required()

// 				}),
// 				failAction: failActionFunction
// 			},
// 			plugins: {
// 				"hapi-swagger": {
// 					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
// 				}
// 			}
// 		}
// 	},
// ];