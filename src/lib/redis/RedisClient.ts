"use strict";

import * as redis from "redis";
import * as util from "util";
import * as _ from "lodash";
import { JOB_SCHEDULER_TYPE, STATUS, SERVER, USER_TYPE } from "@config/index";
import { logger } from "@lib/logger";
import { baseDao, loginHistoryDao } from "@dao/index";
import {
	isObjectId
} from "@utils/appUtils";
import { users, login_histories } from "@models/index";
import { getSphericalDistance, toObjectId, createAndroidPushPayload, createIOSPushPayload, createWebPushPayload, mediaType } from "@utils/appUtils";
import { fcmPushPayload } from "@lib/pushNotification/pushManager";

import {
	DEVICE_TYPE, NOTIFICATION_DATA
} from "@config/index";
import { rabbitMQ } from "@lib/index";
let client;
let pub, sub;

export class RedisClient {

	init() {
		const _this = this;
		const CONF = { db: SERVER.REDIS.DB };
		client = redis.createClient(SERVER.REDIS.PORT, SERVER.REDIS.HOST, CONF, { disable_resubscribing: true });
		client.on("ready", () => {
			logger.info(`Redis server listening on ${SERVER.REDIS.HOST}:${SERVER.REDIS.PORT}, in ${SERVER.REDIS.DB} DB`);
		});
		client.on("error", (error) => {
			logger.error("Error in Redis", error);
			console.log("Error in Redis");
		});

		// .: Activate "notify-keyspace-events" for expired type events
		pub = redis.createClient(SERVER.REDIS.PORT, SERVER.REDIS.HOST, CONF);
		sub = redis.createClient(SERVER.REDIS.PORT, SERVER.REDIS.HOST, CONF);
		pub.send_command("config", ["set", "notify-keyspace-events", "Ex"], SubscribeExpired);
		// .: Subscribe to the "notify-keyspace-events" channel used for expired type events
		function SubscribeExpired(e, r) {
			const expired_subKey = "__keyevent@" + CONF.db + "__:expired";
			sub.subscribe(expired_subKey, function () {
				// console.log(" [i] Subscribed to \"" + expired_subKey + "\" event channel : " + r);
				sub.on("message", function (chan, msg) {
					// console.log("[expired]", msg);
					_this.listenJobs(msg);
				});
			});
		}
	}

	// .: For example (create a key & set to expire in 10 seconds)
	createJobs(params) {
		const expTime = Math.trunc((params.time - Date.now()) / 1000); // in secs
		console.log("createJobs===========================>", params, expTime);
		switch (params.jobName) {
			case JOB_SCHEDULER_TYPE.AUTO_SESSION_EXPIRE:
				this.setExp(`${JOB_SCHEDULER_TYPE.AUTO_SESSION_EXPIRE}.${params.params.userId}.${params.params.deviceId}`, expTime, JSON.stringify({ "deviceId": params.params.deviceId, "userId": params.params.userId }));
				break;
			case JOB_SCHEDULER_TYPE.EXPIRE_GROUP_ACTIVITY:
				this.setExp(`${JOB_SCHEDULER_TYPE.EXPIRE_GROUP_ACTIVITY}.${params.data.activityId}`, expTime, JSON.stringify({ "activityId": params.data.activityId }));
				break;

		}
	}

	async listenJobs(key) {
		const jobName = key.split(".")[0];
		console.log("listenJobs===========================>", key, jobName);
		switch (jobName) {
			case JOB_SCHEDULER_TYPE.AUTO_SESSION_EXPIRE: {
				break;
			}
			case JOB_SCHEDULER_TYPE.EXPIRE_GROUP_ACTIVITY: {
				const activityId = key.split(".")[1];
				await baseDao.updateOne("activities", { "_id": activityId }, { "$set": { status: STATUS.CANCELLED.TYPE, "intervals.$[].status": STATUS.CANCELLED.TYPE } }, {});
				break;
			}

			default: {
				const userId = key.split(".")[0];
				const deviceId = key.split(".")[1];
				if (isObjectId(userId) && deviceId) {
					await loginHistoryDao.removeDeviceById({ userId, deviceId });
					if (SERVER.IS_REDIS_ENABLE) await redisClient.deleteKey(`${userId}.${deviceId}`);
				}
			}
		}
	}

	setExp(key, exp, value) {
		client.setex(key, exp, value);
	}

	getKeys(key) {
		return new Promise((resolve, reject) => {
			client.multi().keys(key).exec(function (error, reply) { if (error) reject(error); else resolve(reply[0]) });
		});
	}

	storeValue(key, value) {
		// client.set(['framework', 'AngularJS']);
		return client.set(key, value, function (error, reply) {
			if (error) {
				console.log(error);
			}
			return reply;
		});
	}

	mset(values) {
		client.mset(values, function (error, object) {
			if (error) {
				console.log(error);
			}
			return object;
		});
	}

	getValue(key) {
		return new Promise(function (resolve, reject) {
			client.get(key, function (error, reply) {
				if (error) {
					console.log(error);
				}
				resolve(reply);
			});
		});
	}

	storeHash(key, value) {
		// client.hmset("tools", "webserver", "expressjs", "database", "mongoDB", "devops", "jenkins");
		// 													OR
		// client.hmset("tools", {"webserver": "expressjs", "database": "mongoDB", "devops": "jenkins"});
		// {"webserver": "expressjs", "database": "mongoDB", "devops": "jenkins"} // store like this
		return client.hmset(key, value, function (error, object) {
			if (error) {
				console.log(error);
			}
			return object;
		});
	}

	getHash(key) {
		return new Promise(function (resolve, reject) {
			client.hgetall(key, function (error, object) {
				if (error) {
					console.log(error);
				}
				resolve(object);
			});
		});
	}

	storeList(key, value) {
		value.unshift(key);
		// client.rpush(['frameworks', 'angularjs', 'backbone']); // push the elements to the right.
		// client.lpush(['frameworks', 'angularjs', 'backbone']); // push the elements to the left.
		return client.rpush(value, function (error, reply) {
			if (error) {
				console.log(error);
			}
			return reply;
		});
	}

	getList(key) {
		// client.lrange(key, startIndex, endIndex or -1);
		return new Promise(function (resolve, reject) {
			client.lrange(key, 0, -1, function (error, reply) {
				if (error) {
					console.log(error);
				}
				resolve(reply);
			});
		});
	}

	async storeSet(key, value) {
		try {
			value.unshift(key);
			// Sets are similar to lists, but the difference is that they don’t allow duplicates
			// client.sadd(['frameworks', 'angularjs', 'backbone']);
			const promise = util.promisify(client.sadd).bind(client);
			await promise(value);
			return {};
		} catch (error) {
			console.log(error);
			return Promise.reject(error);
		}
	}

	async removeFromSet(key, value) {
		try {
			// Redis SREM is used to remove the specified member from the set stored at the key.
			// client.srem('blocked_set', '5c07c44395a7ee2e99608bc9');
			// client.srem('blocked_set', ['5c07c44395a7ee2e99608bc9', '5c07c44e95a7ee2e99608bca']);
			const promise = util.promisify(client.srem).bind(client);
			await promise(key, value);
			return {};
		} catch (error) {
			console.log(error);
			return Promise.reject(error);
		}
	}

	getSet(key) {
		return new Promise(function (resolve, reject) {
			client.smembers(key, function (error, reply) {
				if (error) {
					console.log(error);
				}
				resolve(reply);
			});
		});
	}

	checkKeyExists(key) {
		return client.exists(key, function (error, reply) {
			if (error) {
				console.log(error);
			}
			return reply;
		});
	}

	deleteKey(key) {
		return client.del(key, function (error, reply) {
			if (error) {
				console.log(error);
			}
			console.log(reply)
			return reply;
		});
	}

	expireKey(key, expiryTime) {
		// in seconds
		return client.expireAsync(key, expiryTime, function (error, reply) {
			if (error) {
				console.log(error);
			}
			return reply;
		});
	}

	incrementKey(key, value) {
		// or incrby()
		return client.set(key, 10, function () {
			return client.incr(key, function (error, reply) {
				if (error) {
					console.log(error);
				}
				console.log(reply); // 11
			});
		});
	}

	decrementKey(key, value) {
		// or decrby()
		return client.set(key, 10, function () {
			return client.decr(key, function (error, reply) {
				if (error) {
					console.log(error);
				}
				console.log(reply); // 11
			});
		});
	}

	async brpop(key, timeout = 2) {
		try {
			return new Promise((resolve, reject) => {
				client.brpop(key, timeout, function (error, reply) {
					if (error)
						reject(error);
					else
						resolve(reply)
				});
			});
		} catch (error) {
			console.log(error);
			return Promise.reject(error);
		}
	}

	async addToSortedSet(setname, value, key) {
		try {
			return new Promise((resolve, reject) => {
				client.zadd(setname, value, key, function (error, reply) {
					if (error)
						reject(error);
					else
						resolve(reply)
				});
			});
		} catch (error) {
			console.log(error);
			return Promise.reject(error);
		}
	};

	async getRankFromSortedSet(setname, key) {
		try {
			return new Promise((resolve, reject) => {
				client.zrevrank(setname, key, function (error, reply) {
					if (error)
						reject(error);
					else
						resolve(reply)
				});
			});
		} catch (error) {
			console.log(error);
			return Promise.reject(error);
		}
	};

	async getRankedListFromSortedSet(setName, offset, count) {
		try {
			return new Promise((resolve, reject) => {

				const args2 = [setName, "+inf", "-inf", "WITHSCORES", "LIMIT", offset, count];
				client.zrevrangebyscore(args2, function (error, reply) {
					if (error)
						reject(error);
					else
						resolve(reply)
				});
			});
		} catch (error) {
			console.log(error);
			return Promise.reject(error);
		}
	};

	async sortedListLength(setName) {
		try {
			return new Promise((resolve, reject) => {
				const arg1 = [setName, "-inf", "+inf"];
				client.zcount(arg1, function (error, reply) {
					if (error)
						reject(error);
					else
						resolve(reply)
				});
			});
		} catch (error) {
			console.log(error);
			return Promise.reject(error);
		}
	};
}

export const redisClient = new RedisClient();