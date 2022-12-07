"use strict";

import { Request, ResponseToolkit } from "@hapi/hapi";
import * as Joi from "joi";

import { failActionFunction } from "@utils/appUtils";
import { authorizationHeaderObj } from "@utils/validator";
import {
	SWAGGER_DEFAULT_RESPONSE_MESSAGES,
	SERVER
} from "@config/index";
import { notificationControllerV1 } from "@controllers/index";
import { responseHandler } from "@utils/ResponseHandler";

export const notificationRoute = [
	{
		method: "GET",
		path: `${SERVER.API_BASE_URL}/v1/notification`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const query: ListingRequest = request.query;
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
				const result = await notificationControllerV1.notificationList(query, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "notification"],
			description: "Notification List",
			auth: {
				strategies: ["CommonAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				query: Joi.object({
					pageNo: Joi.number().required().description("Page no"),
					limit: Joi.number().required().description("limit")
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
		path: `${SERVER.API_BASE_URL}/v1/notification`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
			try {
				const result = await notificationControllerV1.notificationDelete(tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "notification"],
			description: "Notification Clear/Delete",
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
	}
];