"use strict";

import * as HapiSwagger from "hapi-swagger";
import * as Inert from "@hapi/inert";
import * as Vision from "@hapi/vision";

import { SERVER } from "@config/environment";

// Register Swagger Plugin
export const plugin = {
	name: "swagger-plugin",
	register: async function (server) {
		const swaggerOptions = {
			info: {
				title: "Agora API Documentation",
				description: "Agora",
				// contact: {
				// 	name: "",
				// 	email: ""
				// },
				version: "1.0.0"
			},
			tags: [
				// {
				// 	name: "categories",
				// 	description: "Operations about categories"
				// }, {
				// 	name: "admin",
				// 	description: "Operations about admin",

				// }, {
				// 	name: "common",
				// 	description: "common API's"
				// }, 
				{
					name: "user",
					description: "Operations about user"
				},
				// {
				// 	name: "role",
				// 	description: "Operations about role"
				// }
			],
			grouping: "tags",
			schemes: [SERVER.PROTOCOL, 'https'],
			basePath: SERVER.API_BASE_URL,
			consumes: [
				"application/json",
				"application/x-www-form-urlencoded",
				"multipart/form-data"
			],
			produces: [
				"application/json"
			],
			securityDefinitions: {
				// basicAuth: {
				// 	type: "basic",
				// 	name: "basic_auth",
				// 	in: "header"
				// },
				api_key: {
					type: "apiKey",
					name: "api_key",
					in: "header"
				}
			},
			security: [{
				api_key: []
			}]
			// security: [{
			// 	basicAuth: []
			// }],
			// sortTags: "name",
			// sortEndpoints: "method",
			// cache: {
			// 	expiresIn: 24 * 60 * 60 * 1000
			// }
		};

		await server.register([
			Inert,
			Vision,
			{
				plugin: HapiSwagger,
				options: swaggerOptions
			}
		]);
	}
};