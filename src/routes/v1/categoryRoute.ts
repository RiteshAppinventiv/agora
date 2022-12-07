"use strict";

import { Request, ResponseToolkit } from "@hapi/hapi";
import * as Joi from "joi";

import { failActionFunction } from "@utils/appUtils";
import { categoryControllerV1 } from "@controllers/index";
import {
	REGEX,
	STATUS,
	SWAGGER_DEFAULT_RESPONSE_MESSAGES,
	SERVER
} from "@config/index";
import { responseHandler } from "@utils/ResponseHandler";
import { authorizationHeaderObj } from "@utils/validator";

export const categoryRoute = [
	{
		method: "POST",
		path: `${SERVER.API_BASE_URL}/v1/categories`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const payload: CategoryRequest.Add = request.payload;
				const result = await categoryControllerV1.addCategory(payload);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "categories"],
			description: "Add Category",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				payload: Joi.object({
					name: Joi.string().trim().required()
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
		path: `${SERVER.API_BASE_URL}/v1/categories`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const query: ListingRequest = request.query;
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
				const result = await categoryControllerV1.categoryList(query, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "categories"],
			description: "Category List",
			notes: "for Admin/User",
			auth: {
				strategies: ["CommonAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				query: Joi.object({
					pageNo: Joi.number().optional().description("Page no"),
					limit: Joi.number().optional().description("limit"),
					searchKey: Joi.string().optional().description("Search by name"),
					sortBy: Joi.string().trim().valid("name", "created").optional().description("name, created"),
					sortOrder: Joi.number().optional().valid(1, -1).description("1 for asc, -1 for desc"),
					status: Joi.string()
						.trim()
						.optional()
						.valid(STATUS.BLOCKED, STATUS.UN_BLOCKED)
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
		path: `${SERVER.API_BASE_URL}/v1/categories`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const query: CategoryRequest.Delete = request.query;
				const result = await categoryControllerV1.deleteCategory(query);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "categories"],
			description: "Block/Unblock Category",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				query: Joi.object({
					categoryId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
					status: Joi.string()
						.trim()
						.required()
						.valid(STATUS.BLOCKED, STATUS.UN_BLOCKED)
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
		path: `${SERVER.API_BASE_URL}/v1/categories/{categoryId}`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const params: CategoryRequest.Id = request.params;
				const result = await categoryControllerV1.categoryDetails(params);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "categories"],
			description: "Category Details",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				params: Joi.object({
					categoryId: Joi.string().trim().regex(REGEX.MONGO_ID).required()
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
		path: `${SERVER.API_BASE_URL}/v1/categories`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const payload: CategoryRequest.Edit = request.payload;
				const result = await categoryControllerV1.editCategory(payload);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "categories"],
			description: "Update Category",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				payload: Joi.object({
					categoryId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
					name: Joi.string().trim().required(),
					status: Joi.string()
						.trim()
						.required()
						.valid(STATUS.BLOCKED, STATUS.UN_BLOCKED)
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
		path: `${SERVER.API_BASE_URL}/v1/categories/view-more`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const query: ListingRequest = request.query;
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;

				const params: CategoryRequest.Text = query;
				const result = await categoryControllerV1.categoryViewMore(params, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "categories"],
			description: "View more categeory list",
			auth: {
				strategies: ["CommonAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				query: Joi.object({
					searchKey: Joi.string().trim().optional(),
					pageNo: Joi.number().optional().description("Page no"),
					limit: Joi.number().optional().description("limit"),

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
];