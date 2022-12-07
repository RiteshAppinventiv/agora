"use strict";

import { Request, ResponseToolkit } from "@hapi/hapi";
import * as Joi from "joi";

import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj } from "@utils/validator";
import { contentControllerV1 } from "@controllers/index";
import {
	CONTENT_TYPE,
	REGEX,
	SWAGGER_DEFAULT_RESPONSE_MESSAGES,
	SERVER
} from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";

export const contentRoute = [
	{
		method: "GET",
		path: `${SERVER.API_BASE_URL}/v1/contents/{type}`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const params: ContentRequest.Type = request.params;
				const result = await contentControllerV1.contentDetails(params);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "contents"],
			description: "Content Details",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				params: Joi.object({
					type: Joi.string()
						.trim()
						.valid(...Object.values(CONTENT_TYPE).filter(v => v !== CONTENT_TYPE.FAQ))
						.required()
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
		method: "PUT",
		path: `${SERVER.API_BASE_URL}/v1/contents`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const payload: ContentRequest.Edit = request.payload;
				const result = await contentControllerV1.editContent(payload);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "contents"],
			description: "Update if Exists or Create Content.",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				payload: Joi.object({
					data: Joi.string().trim().required(),
					type: Joi.string()
						.trim()
						.valid(...Object.values(CONTENT_TYPE).filter(v => v !== CONTENT_TYPE.FAQ))
						.required()
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
		method: "GET",
		path: `${SERVER.API_BASE_URL}/v1/contents/view`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const query: ContentRequest.View = request.query;
				const result = await contentControllerV1.viewContent(query);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "contents"],
			description: "View Content",
			validate: {
				query: Joi.object({
					type: Joi.string()
						.trim()
						.valid(...Object.values(CONTENT_TYPE))
						.required()
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
		path: `${SERVER.API_BASE_URL}/v1/contents/faq`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const payload: ContentRequest.AddFaq = request.payload;
				const result = await contentControllerV1.addFaq(payload);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "contents"],
			description: "Add Faq",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				payload: Joi.object({
					position: Joi.number().required(),
					question: Joi.string().trim().required(),
					answer: Joi.string().trim().required()
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
		method: "GET",
		path: `${SERVER.API_BASE_URL}/v1/contents/faq`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const query: ListingRequest = request.query;
				const result = await contentControllerV1.faqList(query);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "contents"],
			description: "Faq List",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				query: Joi.object({
					pageNo: Joi.number().required().description("Page no"),
					limit: Joi.number().required().description("limit"),
					sortBy: Joi.string().trim().valid("created", "position").optional().description("created, position"),
					sortOrder: Joi.number().optional().valid(1, -1).description("1 for asc, -1 for desc"),
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
		method: "PUT",
		path: `${SERVER.API_BASE_URL}/v1/contents/faq`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const payload: ContentRequest.EditFaq = request.payload;
				const result = await contentControllerV1.editFaq(payload);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "contents"],
			description: "Edit Faq",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				payload: Joi.object({
					faqId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
					position: Joi.number().required(),
					question: Joi.string().trim().required(),
					answer: Joi.string().trim().required()
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
		method: "DELETE",
		path: `${SERVER.API_BASE_URL}/v1/contents/faq`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const params: ContentRequest.FaqId = request.query;
				const result = await contentControllerV1.deleteFaq(params);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "contents"],
			description: "Delete Faq",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				query: Joi.object({
					faqId: Joi.string().trim().regex(REGEX.MONGO_ID).required()
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
		method: "GET",
		path: `${SERVER.API_BASE_URL}/v1/contents/faq/{faqId}`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const params: ContentRequest.FaqId = request.params;
				const result = await contentControllerV1.faqDetails(params);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "contents"],
			description: "FAQ Details",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				params: Joi.object({
					faqId: Joi.string().trim().regex(REGEX.MONGO_ID).required()
				}),
				failAction: failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	}
];