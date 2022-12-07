"use strict";

import { BaseDao } from "@dao/BaseDao";
import { toObjectId } from "@utils/appUtils";
import { STATUS } from "@config/constant";

export class NotificationDao extends BaseDao {

	/**
	 * @function addNotification
	 */
	async addNotification(params: NotificationRequest.Add) {
		try {
			return await this.save("notifications", params);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function addManyNotification
	 */
	async addManyNotification(params) {
		try {
			return await this.insertMany("notifications", params, { ordered: false });
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function notificationList
	 */
	async notificationList(params: ListingRequest, userId: string) {
		try {
			const aggPipe = [];

			const match: any = {};
			match.receiverId = { "$in": [toObjectId(userId)] };
			match.status = { "$ne": STATUS.DELETED };
			aggPipe.push({ "$match": match });

			aggPipe.push({ "$project": { receiverId: 0, senderId: 0, updatedAt: 0, createdAt: 0, isRead: 0 } });

			aggPipe.push({ "$sort": { created: -1 } });

			return await this.paginate("notifications", aggPipe, params.limit, params.pageNo, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	  * @function notificationDelete
	  */
	async notificationDelete(userId: string) {
		try {
			const query: any = {};
			query.receiverId = userId;

			const update = {};
			update["$set"] = { status: STATUS.DELETED };
			return await this.updateMany("notifications", query, update, {});
		} catch (error) {
			throw error;
		}
	}
}

export const notificationDao = new NotificationDao();