"use strict";

import {
	createAndroidPushPayload,
	createIOSPushPayload,
	createWebPushPayload,
	splitArrayInToChunks
} from "@utils/appUtils";
import { DEVICE_TYPE } from "@config/constant";
import { sendPush } from "@lib/pushNotification/fcm";

const pushNotification = async function (data) {
	return new Promise(async (resolve, reject) => {
		try {
			let promiseResult = [];
			const deviceChunks = splitArrayInToChunks(data.deviceIds);
			for (let i = 0; i < deviceChunks.length; i++) {
				promiseResult.push(sendPush(deviceChunks[i], data.deviceType, data.payload));
			}
			resolve(Promise.all(promiseResult));
		} catch (error) {
			reject(error);
		}
	});
};

/**
 * @function _createPayloadAndSendPush
 * @author Rajat Maheshwari
 * @params {data: device token, notificationData: notification payload}
 */
 const createPayloadAndSendPush = async function (data, notificationData) {
	console.log('createPayloadAndSendPush Invoked')
	let androidUsers = [], iosUsers = [], webUsers= [];
	for (let i = 0; i < data.length; i++) {
		if (data[i].platform === DEVICE_TYPE.ANDROID) {
			androidUsers.push({ "userId": data[i].userId, "deviceToken": data[i].deviceToken });
		}
		if (data[i].platform === DEVICE_TYPE.IOS) {
			iosUsers.push({ "userId": data[i].userId, "deviceToken": data[i].deviceToken });
		}
		if (data[i].platform === DEVICE_TYPE.WEB) {
			webUsers.push({ "userId": data[i].userId, "deviceToken": data[i].deviceToken });
		}
	}

	// create android and ios payload
	let androidPayload, iosPayload, webPayload;
	if (androidUsers.length) {
		androidPayload = createAndroidPushPayload(notificationData);
		const noticiationPayload = {
			"deviceIds": androidUsers.map(v => v.deviceToken),
			"payload": androidPayload,
			"deviceType": DEVICE_TYPE.ANDROID
		};
		await pushNotification(noticiationPayload);
	}
	if (iosUsers.length) {
		iosPayload = createIOSPushPayload(notificationData);
		const noticiationPayload = {
			"deviceIds": iosUsers.map(v => v.deviceToken),
			"payload": iosPayload,
			"deviceType": DEVICE_TYPE.IOS
		};
		await pushNotification(noticiationPayload);
	}
	if(webUsers.length) {
		webPayload = createWebPushPayload(notificationData);
		const noticiationPayload = {
			"deviceIds": webUsers.map(v => v.deviceToken),
			"payload": webPayload,
			"deviceType": DEVICE_TYPE.WEB
		};
		await pushNotification(noticiationPayload);
	}
};

const fcmPushPayload = function (deviceIds, payload, deviceType) {
	const noticiationPayload = {
		"deviceIds": deviceIds.map(v => v.deviceToken),
		"payload": payload,
		"deviceType": deviceType
	};
	return noticiationPayload;
};

export {
	pushNotification,
	createPayloadAndSendPush,
	fcmPushPayload
};