// "use strict";

// import { Request, ResponseToolkit } from "@hapi/hapi";
// import * as Joi from "joi";

// import { failActionFunction } from "@utils/appUtils";
// import { authorizationHeaderObj } from "@utils/validator";
// import {
// 	DEVICE_TYPE,
// 	REGEX,
// 	SWAGGER_DEFAULT_RESPONSE_MESSAGES,
// 	VERSION_UPDATE_TYPE,
// 	SERVER
// } from "@config/index";
// import { versionControllerV1 } from "@controllers/index";
// import { responseHandler } from "@utils/ResponseHandler";

// export const versionRoute = [
// 	{
// 		method: "POST",
// 		path: `${SERVER.API_BASE_URL}/v1/version`,
// 		handler: async (request: Request | any, h: ResponseToolkit) => {
// 			try {
// 				const payload: VersionRequest.Add = request.payload;
// 				const result = await versionControllerV1.addVersion(payload);
// 				return responseHandler.sendSuccess(h, result);
// 			} catch (error) {
// 				return responseHandler.sendError(request, error);
// 			}
// 		},
// 		config: {
// 			tags: ["api", "version"],
// 			description: "Add Version",
// 			auth: {
// 				strategies: ["AdminAuth"]
// 			},
// 			validate: {
// 				headers: authorizationHeaderObj,
// 				payload: Joi.object({
// 					name: Joi.string().trim().required(),
// 					description: Joi.string().trim().optional().allow(""),
// 					platform: Joi.string()
// 						.trim()
// 						.required()
// 						.valid(DEVICE_TYPE.ANDROID, DEVICE_TYPE.IOS)
// 						.description("device OS '1'-Android, '2'-iOS"),
// 					updateType: Joi.string()
// 						.trim()
// 						.required()
// 						.valid(Object.values(VERSION_UPDATE_TYPE).join(", ")),
// 					// currentVersion: Joi.alternatives().try([
// 					// 	Joi.number().empty("").allow(null),
// 					// 	Joi.string().regex(/\d{1,2}[\,\.]{1}/)
// 					// ])
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
// 		path: `${SERVER.API_BASE_URL}/v1/version`,
// 		handler: async (request: Request | any, h: ResponseToolkit) => {
// 			try {
// 				const query: ListingRequest = request.query;
// 				const result = await versionControllerV1.versionList(query);
// 				return responseHandler.sendSuccess(h, result);
// 			} catch (error) {
// 				return responseHandler.sendError(request, error);
// 			}
// 		},
// 		config: {
// 			tags: ["api", "version"],
// 			description: "Version List",
// 			auth: {
// 				strategies: ["AdminAuth"]
// 			},
// 			validate: {
// 				headers: authorizationHeaderObj,
// 				query: Joi.object({
// 					pageNo: Joi.number().required().description("Page no"),
// 					limit: Joi.number().required().description("limit"),
// 					searchKey: Joi.string().optional().description("Search by Version name, title"),
// 					sortBy: Joi.string().trim().valid("name", "title", "created").optional().description("name, title, created"),
// 					sortOrder: Joi.number().optional().description("1 for asc, -1 for desc")
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
// 		method: "DELETE",
// 		path: `${SERVER.API_BASE_URL}/v1/version`,
// 		handler: async (request: Request | any, h: ResponseToolkit) => {
// 			try {
// 				const query: VersionRequest.Id = request.query;
// 				const result = await versionControllerV1.deleteVersion(query);
// 				return responseHandler.sendSuccess(h, result);
// 			} catch (error) {
// 				return responseHandler.sendError(request, error);
// 			}
// 		},
// 		config: {
// 			tags: ["api", "version"],
// 			description: "Delete Version",
// 			auth: {
// 				strategies: ["AdminAuth"]
// 			},
// 			validate: {
// 				headers: authorizationHeaderObj,
// 				query: Joi.object({
// 					versionId: Joi.string().trim().regex(REGEX.MONGO_ID).required()
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
// 		path: `${SERVER.API_BASE_URL}/v1/version/details`,
// 		handler: async (request: Request | any, h: ResponseToolkit) => {
// 			try {
// 				const query: VersionRequest.Id = request.query;
// 				const result = await versionControllerV1.versionDetails(query);
// 				return responseHandler.sendSuccess(h, result);
// 			} catch (error) {
// 				return responseHandler.sendError(request, error);
// 			}
// 		},
// 		config: {
// 			tags: ["api", "version"],
// 			description: "Version Details",
// 			auth: {
// 				strategies: ["AdminAuth"]
// 			},
// 			validate: {
// 				headers: authorizationHeaderObj,
// 				query: Joi.object({
// 					versionId: Joi.string().trim().regex(REGEX.MONGO_ID).required()
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
// 		method: "PUT",
// 		path: `${SERVER.API_BASE_URL}/v1/version`,
// 		handler: async (request: Request | any, h: ResponseToolkit) => {
// 			try {
// 				const payload: VersionRequest.Edit = request.payload;
// 				const result = await versionControllerV1.editVersion(payload);
// 				return responseHandler.sendSuccess(h, result);
// 			} catch (error) {
// 				return responseHandler.sendError(request, error);
// 			}
// 		},
// 		config: {
// 			tags: ["api", "version"],
// 			description: "Update Version",
// 			auth: {
// 				strategies: ["AdminAuth"]
// 			},
// 			validate: {
// 				headers: authorizationHeaderObj,
// 				payload: Joi.object({
// 					versionId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
// 					name: Joi.string().trim().required(),
// 					description: Joi.string().trim().optional().allow(""),
// 					platform: Joi.string()
// 						.trim()
// 						.required()
// 						.valid(DEVICE_TYPE.ANDROID, DEVICE_TYPE.IOS)
// 						.description("device OS '1'-Android, '2'-iOS"),
// 					updateType: Joi.string()
// 						.trim()
// 						.required()
// 						.valid(Object.values(VERSION_UPDATE_TYPE).join(", ")),
// 					// currentVersion: Joi.alternatives().try([
// 					// 	Joi.number().empty("").allow(null),
// 					// 	Joi.string().regex(/\d{1,2}[\,\.]{1}/)
// 					// ])
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
// 		path: `${SERVER.API_BASE_URL}/v1/version/check`,
// 		handler: async (request: Request | any, h: ResponseToolkit) => {
// 			try {
// 				const query: VersionRequest.Check = request.query;
// 				const platform = request.headers.platform ? request.headers.platform : DEVICE_TYPE.ANDROID;
// 				const result = await versionControllerV1.versionCheck({ ...query, platform });
// 				return responseHandler.sendSuccess(h, result);
// 			} catch (error) {
// 				return responseHandler.sendError(request, error);
// 			}
// 		},
// 		config: {
// 			tags: ["api", "version"],
// 			description: "Version Check",
// 			validate: {
// 				query: Joi.object({
// 					// currentVersion: Joi.alternatives().try([
// 					// 	Joi.number().empty("").allow(null),
// 					// 	Joi.string().regex(/\d{1,2}[\,\.]{1}/)
// 					// ])
// 				}),
// 				failAction: failActionFunction
// 			},
// 			plugins: {
// 				"hapi-swagger": {
// 					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
// 				}
// 			}
// 		}
// 	}
// ];