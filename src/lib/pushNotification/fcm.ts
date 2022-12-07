"use strict";

const FCM = require("fcm-node");

import { consolelog } from "@utils/appUtils";
import { DEVICE_TYPE, SERVER } from "@config/index";

const fcmServerKey = SERVER.FCM_SERVER_KEY; // put your server key here

const fcm = new FCM(fcmServerKey);

const sendPush = async function (deviceIds, deviceType, payload) {
	consolelog("deviceIds", deviceIds, false);
	consolelog("deviceType", deviceType, false);
	consolelog("payload", payload, false);
	let message = {};
	if (deviceType === DEVICE_TYPE.WEB) {
		message = {
			registration_ids: deviceIds,
			// to: deviceIds,
			notification: payload
		}
	}
	if (deviceType === DEVICE_TYPE.ANDROID) {
		message = {
			registration_ids: deviceIds,
			// to: deviceIds,
			data: payload
		}
	}
	if (deviceType === DEVICE_TYPE.IOS) {
		message = {
			registration_ids: deviceIds,
			// to: deviceIds,
			data: payload.data,
			notification: payload.notification
		}
	}

	if (deviceType === DEVICE_TYPE.WEB) {
		message = {
			registration_ids: deviceIds,
			// to: deviceIds,
			data: payload.data,
			notification: payload.notification
		}
	}
	return new Promise(async (resolve, reject) => {
		try {
			fcm.send(message, function (error, response) {
				console.log(error, response);
				if (error) {
					// console.log(error);
					// reject(error);
					resolve({});
				} else {
					resolve(response);
				}
			});
		} catch (error) {
			reject(error);
		}
	});
};

const subscribeToTopic = async function (deviceIds, payload) {
	return new Promise(async (resolve, reject) => {
		try {
			fcm.subscribeToTopic(deviceIds, "some_topic_name", (err, res) => {
				console.log(err, res);
			});
		} catch (error) {
			reject(error);
		}
	});
};

const unsubscribeToTopic = async function (deviceIds, payload) {
	return new Promise(async (resolve, reject) => {
		try {
			fcm.unsubscribeToTopic(deviceIds, "some_topic_name", (err, res) => {
				console.log(err, res);
			});
		} catch (error) {
			reject(error);
		}
	});
};

export {
	sendPush,
	subscribeToTopic,
	unsubscribeToTopic
};