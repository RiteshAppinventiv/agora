"use strict";

const mongoose = require("mongoose");

import { SERVER } from "@config/environment";
import { logger } from "@lib/logger";
import { stringToBoolean } from "@utils/appUtils";

export class Database {

	async connectToDb() {
		return new Promise((resolve, reject) => {
			try {
				const dbName = SERVER.MONGO.DB_NAME;
				let dbUrl = SERVER.MONGO.DB_URL;
				let dbOptions: any = SERVER.MONGO.OPTIONS;

				if (stringToBoolean(SERVER.MONGO.REPLICA || "false")) {
					dbOptions = { ...dbOptions, ...SERVER.MONGO.REPLICA_OPTION };
					dbOptions.ssl = stringToBoolean(dbOptions.ssl || "false");
				}
				if (SERVER.ENVIRONMENT === "production") {
					logger.info(`Configuring db in ${SERVER.ENVIRONMENT} mode`);
					dbUrl = dbUrl + dbName;
				} else {
					logger.info(`Configuring db in ${SERVER.ENVIRONMENT} mode`);
					dbUrl = dbUrl + dbName;
					mongoose.set("debug", true);
				}

				logger.info(`Connecting to DB ${dbName} at ${dbUrl}`);
				mongoose.connect(dbUrl, dbOptions);

				// CONNECTION EVENTS
				// When successfully connected
				mongoose.connection.on("connected", function () {
					logger.info(`Connected to DB ${dbName} at ${dbUrl}`);
					resolve({});
				});

				// If the connection throws an error
				mongoose.connection.on("error", error => {
					logger.error("DB connection error: " + error);
					reject(error);
				});

				// When the connection is disconnected
				mongoose.connection.on("disconnected", () => {
					logger.error("DB connection disconnected.");
					reject("DB connection disconnected.");
				});
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * @function connectToTargetDb
	 * @description use for migration:  connects to the source database
	 */
	async connectToTargetDb() {
		try {
			let MongoClient = require("mongodb").MongoClient;
			let dbUrl = SERVER.TARGET_MONGO.DB_URL;
			return await MongoClient.connect(dbUrl, SERVER.TARGET_MONGO.OPTIONS);
		} catch (error) {
			console.log(error);
		}
	}
}