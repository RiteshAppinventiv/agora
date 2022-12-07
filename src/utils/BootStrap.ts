"use strict";

import { adminDaoV1 } from "@dao/index";
import { CONTENT_TYPE, SERVER } from "@config/index";
import { Database } from "@utils/Database";
import { redisClient } from "@lib/redis/RedisClient";
import { baseDao } from "@dao/index";
import { rabbitMQ } from "@lib/RabbitMQ";

export class BootStrap {

	private dataBaseService = new Database();

	async bootStrap(server) {
		await this.dataBaseService.connectToDb();
		// await this.createAdmin();
		// await this.addContentManagement();

		// If redis is enabled
		if (SERVER.IS_REDIS_ENABLE) redisClient.init();

		// ENABLE/DISABLE Console Logs
		if (SERVER.ENVIRONMENT === "production") {
			console.log = function () { };
		}
		// rabbitMQ.init();
	}

	async createAdmin() {
		const adminData = {
			"email": SERVER.ADMIN_CREDENTIALS.EMAIL,
			"password": SERVER.ADMIN_CREDENTIALS.PASSWORD,
			"name": SERVER.ADMIN_CREDENTIALS.NAME
		};
		const step1 = await adminDaoV1.isEmailExists(adminData);
		if (!step1) adminDaoV1.createAdmin(adminData);
	}

	async addContentManagement() {
		const step1 = await baseDao.countDocuments("contents", {});
		if (!step1) {
			const data = [];
			for (const v in CONTENT_TYPE) {
				if (v !== CONTENT_TYPE.FAQ) {
					data.push({
						"type": CONTENT_TYPE[v],
						"data": ""
					});
				}
			}
			baseDao.insertMany("contents", data, { "ordered": false });
		}
	}
}