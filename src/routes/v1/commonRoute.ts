"use strict";

import { Request, ResponseToolkit } from "@hapi/hapi";
import * as Joi from "joi";

import { failActionFunction } from "@utils/appUtils";
import { commonControllerV1 } from "@controllers/index";
import {
	MESSAGES,
	fileUploadExts,
	SUPPORTER_PROFILE_STEPS,
	SWAGGER_DEFAULT_RESPONSE_MESSAGES,
	SERVER
} from "@config/index";
import { imageUtil } from "@lib/ImageUtil";
import { responseHandler } from "@utils/ResponseHandler";

export const commonRoute = [
	{
		method: "POST",
		path: `${SERVER.API_BASE_URL}/v1/common/media-upload`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const payload = request.payload;
				const result = { "image": await imageUtil.uploadSingleMediaToS3(payload.file) };
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "common"],
			description: "Media Upload",
			auth: {
				strategies: ["BasicAuth"]
			},
			payload: {
				maxBytes: 1000 * 1000 * 500,
				output: "stream",
				allow: "multipart/form-data", // important
				parse: true,
				timeout: false,
				multipart: true // <-- this fixed the media type error
			},
			validate: {
				payload: Joi.object({
					file: Joi.any().meta({ swaggerType: "file" }).required().description(fileUploadExts.join(", "))
				}),
				failAction: failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					payloadType: "form",
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "GET",
		path: `/deeplink`,
		handler: async (request: Request | any, h: ResponseToolkit) => {
			try {
				const query: DeeplinkRequest = request.query;
				return await commonControllerV1.deepLink(request, query);
			} catch (error) {
				const message = MESSAGES.ERROR.LINK_EXPIRED.message;
				return h.view("mail-link-expired", { "name": request.query.name, "message": message, "year": new Date().getFullYear() });
			}
		},
		options: {
			tags: ["api", "common"],
			description: "Deep Link",
			validate: {
				query: Joi.object({
					android: Joi.string().trim().optional(),
					ios: Joi.string().trim().optional(),
					fallback: Joi.string().trim().optional(),
					token: Joi.string().trim().optional(),
					name: Joi.string().required(),
					type: Joi.string()
						.trim()
						.valid(
							SUPPORTER_PROFILE_STEPS.UPLOAD_SUPPORTING_DOCUMENT.type,
							SUPPORTER_PROFILE_STEPS.UPLOAD_CERTIFICATIONS.type,
							SUPPORTER_PROFILE_STEPS.UPLOAD_RESUME.type,
							SUPPORTER_PROFILE_STEPS.NDIS_TRAINING_CERTIFICATE.type
						)
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

];