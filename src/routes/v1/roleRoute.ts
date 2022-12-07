"use strict";

import * as Joi from "joi";

import { roleControllerV1 } from "@controllers/index";
import * as appUtils from "@utils/appUtils";
import {
	MODULES,
	MODULES_ID,
	SERVER,
	SWAGGER_DEFAULT_RESPONSE_MESSAGES,
	REGEX,
	STATUS
} from "@config/index";
import { authorizationHeaderObj, headerObject } from "@utils/validator";
import { ResponseHandler } from "@utils/ResponseHandler";
let responseHandler = new ResponseHandler();

export let roleRoute = [
	{
		method: "POST",
		path: `${SERVER.API_BASE_URL}/role`,
		handler: async (request, h) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
			let payload: RoleRequest.CreateRole = request.payload;
			try {
				let result = await roleControllerV1.createRole(payload, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "role"],
			description: "Create Role",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				payload: Joi.object({
					role: Joi.string().trim().required(),
					permission: Joi.array().items(Joi.object({
						module: Joi.string().trim().valid(MODULES.BANNER_MANAGEMENT, MODULES.CONTENT_MANAGEMENT, MODULES.NOTIFICATION_MANAGEMENT).required(),
						moduleId: Joi.string().trim().valid(MODULES_ID.BANNER_MANAGEMENT, MODULES_ID.CONTENT_MANAGEMENT, MODULES_ID.NOTIFICATION_MANAGEMENT).required(),
						all: Joi.boolean().optional(),
						view: Joi.boolean().optional(),
						add: Joi.boolean().optional(),
						edit: Joi.boolean().optional(),
						delete: Joi.boolean().optional(),
						activeInactive: Joi.boolean().optional(),
					})).required(),

				}),
				failAction: appUtils.failActionFunction
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
		path: `${SERVER.API_BASE_URL}/role`,
		handler: async (request, h) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
			let payload: RoleRequest.EditRole = request.payload;
			try {
				let result = await roleControllerV1.editRole(payload, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "role"],
			description: "Edit Role",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				payload: Joi.object({
					roleId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
					role: Joi.string().trim().optional(),
					permission: Joi.array().items(Joi.object({
						module: Joi.string().trim().valid(MODULES.BANNER_MANAGEMENT, MODULES.CONTENT_MANAGEMENT, MODULES.NOTIFICATION_MANAGEMENT).required(),
						moduleId: Joi.string().trim().valid(MODULES_ID.BANNER_MANAGEMENT, MODULES_ID.CONTENT_MANAGEMENT, MODULES_ID.NOTIFICATION_MANAGEMENT).required(),

						all: Joi.boolean().optional(),
						view: Joi.boolean().optional(),
						add: Joi.boolean().optional(),
						edit: Joi.boolean().optional(),
						delete: Joi.boolean().optional(),
						activeInactive: Joi.boolean().optional(),
					})).optional()
				}),
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "PATCH",
		path: `${SERVER.API_BASE_URL}/role/block-unblock`,
		handler: async (request, h) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
			let payload: RoleRequest.BlockUnblockRole = request.payload;
			try {
				let result = await roleControllerV1.blockRole(payload, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "role"],
			description: "Block Unblock Role",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				payload: Joi.object({
					roleId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
					status: Joi.number().valid(
						STATUS.BLOCKED,
						STATUS.UN_BLOCKED
					).required().description("blocked-1, unblocked-2")
				}),
				failAction: appUtils.failActionFunction
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
		path: `${SERVER.API_BASE_URL}/role/{roleId}`,
		handler: async (request, h) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
			let params: RoleRequest.RoleId = request.params;
			try {
				let result = await roleControllerV1.deleteRole(params, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "role"],
			description: "Delete Role",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				params: Joi.object({
					roleId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
				}),
				failAction: appUtils.failActionFunction
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
		path: `${SERVER.API_BASE_URL}/role`,
		handler: async (request, h) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
			let query: ListingRequest = request.query;
			try {
				let result = await roleControllerV1.roleList(query, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "role"],
			description: "Role List",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				query: Joi.object({
					pageNo: Joi.number().min(1).required(),
					limit: Joi.number().min(1).required(),
					searchKey: Joi.string().allow("").optional().description("Search by role"),
					sortBy: Joi.string().trim().valid("role", "createdAt", "updatedAt", "status").optional().description("Sort by role, created, updated, status"),
					sortOrder: Joi.number().valid(1, -1).optional().description("1 for asc, -1 for desc"),
					status: Joi.number().valid(
						STATUS.BLOCKED,
						STATUS.UN_BLOCKED
					).optional().description("blocked-1, unblocked-2"),
					fromDate: Joi.number().optional().description("in timestamp"),
					toDate: Joi.number().optional().description("in timestamp")
				}),
				failAction: appUtils.failActionFunction
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
		path: `${SERVER.API_BASE_URL}/role/{roleId}`,
		handler: async (request, h) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
			let params: RoleRequest.RoleId = request.params;
			try {
				let result = await roleControllerV1.roleDetails(params, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "role"],
			description: "Role Details",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				params: Joi.object({
					roleId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
				}),
				failAction: appUtils.failActionFunction
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
		path: `${SERVER.API_BASE_URL}/subadmin`,
		handler: async (request, h) => {
			let payload: RoleRequest.CreateSubAdmin = request.payload;
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
			try {
				let result = await roleControllerV1.createSubAdmin(payload, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "subadmin"],
			description: "Create Sub Admin",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				payload: Joi.object({
					roleId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
					name: Joi.string().trim().required(),
					email: Joi.string().email({ minDomainSegments: 2 }).regex(REGEX.EMAIL).lowercase().trim().required(),
				}),
				failAction: appUtils.failActionFunction
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
		path: `${SERVER.API_BASE_URL}/subadmin`,
		handler: async (request, h) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
			let payload: RoleRequest.EditSubAdmin = request.payload;
			try {
				let result = await roleControllerV1.editSubAdmin(payload, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "subadmin"],
			description: "Edit SubAdmin",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				payload: Joi.object({
					adminId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
					roleId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(),
					name: Joi.string().trim().optional(),
				}),
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
	{
		method: "PATCH",
		path: `${SERVER.API_BASE_URL}/subadmin/block-unblock`,
		handler: async (request, h) => {
			let payload: RoleRequest.BlockSubAdmin = request.payload;
			try {
				const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
				let result = await roleControllerV1.blockUnblockSubAdmin(payload, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "subadmin"],
			description: "Block Unblock Sub Admin",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				payload: Joi.object({
					adminId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
					status: Joi.number().valid(
						STATUS.BLOCKED,
						STATUS.UN_BLOCKED
					).required().description("BLOCKED-1, UN-BLOCKED-2")
				}),
				failAction: appUtils.failActionFunction
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
		path: `${SERVER.API_BASE_URL}/subadmin/{adminId}`,
		handler: async (request, h) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
			let params: RoleRequest.AdminId = request.params;
			try {
				let result = await roleControllerV1.deleteSubAdmin(params, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "subadmin"],
			description: "Delete SubAdmin",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				params: Joi.object({
					adminId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
				}),
				failAction: appUtils.failActionFunction
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
		path: `${SERVER.API_BASE_URL}/subadmin`,
		handler: async (request, h) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
			let query: RoleRequest.SubAdminList = request.query;
			try {
				let result = await roleControllerV1.subAdminList(query, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "subadmin"],
			description: "Sub Admin List",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				query: Joi.object({
					pageNo: Joi.number().min(1).required(),
					limit: Joi.number().min(1).required(),
					searchKey: Joi.string().allow("").optional().description("Search by name, email"),
					sortBy: Joi.string().trim().valid("name", "email", "role", "createdAt", "status").optional().description("Sort by name, email, role, created, status"),
					sortOrder: Joi.number().valid(1, -1).optional().description("1 for asc, -1 for desc"),
					status: Joi.number().valid(
						STATUS.BLOCKED,
						STATUS.UN_BLOCKED
					).optional().description("blocked-1, unblocked-2"),
					fromDate: Joi.number().optional().description("in timestamp"),
					toDate: Joi.number().optional().description("in timestamp"),
					roleId: Joi.string().trim().regex(REGEX.MONGO_ID).optional(),
				}),
				failAction: appUtils.failActionFunction
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
		path: `${SERVER.API_BASE_URL}/subadmin/{adminId}`,
		handler: async (request, h) => {
			const tokenData: TokenData = request.auth && request.auth.credentials && request.auth.credentials.tokenData;
			let params: RoleRequest.AdminId = request.params;
			try {
				let result = await roleControllerV1.subAdminDetails(params, tokenData);
				return responseHandler.sendSuccess(h, result);
			} catch (error) {
				return responseHandler.sendError(request, error);
			}
		},
		config: {
			tags: ["api", "subadmin"],
			description: "Sub Admin Details",
			auth: {
				strategies: ["AdminAuth"]
			},
			validate: {
				headers: authorizationHeaderObj,
				params: Joi.object({
					adminId: Joi.string().trim().regex(REGEX.MONGO_ID).required(),
				}),
				failAction: appUtils.failActionFunction
			},
			plugins: {
				"hapi-swagger": {
					responseMessages: SWAGGER_DEFAULT_RESPONSE_MESSAGES
				}
			}
		}
	},
];