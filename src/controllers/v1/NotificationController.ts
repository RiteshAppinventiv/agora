"use strict";

import { MESSAGES } from "@config/constant";
import { notificationDaoV1 } from "@dao/index";

export class NotificationController {

	/**
	 * @function notificationList
	 */
	async notificationList(params: ListingRequest, tokenData: TokenData) {
		try {
			const step1 = await notificationDaoV1.notificationList(params, tokenData.userId);
			return MESSAGES.SUCCESS.LIST(step1);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function notificationDelete
	 */
	async notificationDelete(tokenData: TokenData) {
		try {
			await notificationDaoV1.notificationDelete(tokenData.userId);
			return MESSAGES.SUCCESS.NOTIFICATION_DELETED;
		} catch (error) {
			throw error;
		}
	}
}

export const notificationController = new NotificationController();