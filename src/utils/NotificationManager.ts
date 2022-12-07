"use strict";

import * as _ from "lodash";
import * as moment from "moment";
import * as promise from "bluebird";
import {
	NOTIFICATION_DATA,
	STATUS
} from "@config/index";
import { baseDao, notificationDaoV1, userDaoV1 } from "@dao/index";
import { createPayloadAndSendPush } from "@lib/pushNotification/pushManager";
import { userControllerV1 } from "@controllers/index";

export class NotificationManager {

	/**
	   * @function profileIncompleteNotification
	 * @description when any field is incomplete during the onboarding
	 * @param {object} tokenData - user data
		 */
	async profileIncompleteNotification(tokenData: TokenData) {
		let notificationData = NOTIFICATION_DATA.ADD_EDIT_EVENT(tokenData.language, tokenData.userId, {}, '');
		notificationData = _.extend(notificationData, { "receiverId": [tokenData.userId] });
		//	await notificationDaoV1.addNotification(notificationData);

		const options: any = { lean: true };
		const tokens = await baseDao.find("login_histories", { "userId": tokenData.userId, "isLogin": true, "pushNotificationStatus": true, "status": STATUS.UN_BLOCKED }, { userId: 1, platform: 1, deviceToken: 1 }, options, {}, {}, {});
		if (tokens.length) await createPayloadAndSendPush(tokens, notificationData);
	}


}

export const notificationManager = new NotificationManager();