"use strict";

import { BaseDao } from "@dao/BaseDao";
import { FRIEND_REQUEST_STATUS } from "@config/constant";

export class FriendDao extends BaseDao {

	/**
	 * @function isAlreadyAFriend
	 * @description to check if both user is already sended request to each other or already friend or not
	 */
	async isAlreadyAFriend(params, userId: string) {
		try {
			const query: any = {};
			query["$or"] = [
				{ "$and": [{ "userId": params.userId }, { "friendId._id": userId }] },
				{ "$and": [{ "userId": userId }, { "friendId._id": params.userId }] }
			];

			const projection = { createdAt: 0, updatedAt: 0 };

			return await this.findOne("friends", query, projection);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function addFriend
	 */
	async addFriend(params: UserRequest.FriendRequest) {
		try {
			return await this.save("friends", params);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function requestDetails
	 */
	async requestDetails(requestId: string, project = {}) {
		try {
			const query: any = {};
			query._id = requestId;

			const projection = (Object.values(project).length) ? project : { createdAt: 0, updatedAt: 0 };

			return await this.findOne("friends", query, projection);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function getAllFriends
	 */
	async getAllFriends(userId: string) {
		try {
			const query: any = {};
			query["$or"] = [
				{ "userId": userId },
				{ "friendId._id": userId }
			];
			query.status = FRIEND_REQUEST_STATUS.REQUEST_ACCEPTED;

			const projection = { userId: 1, "friendId._id": 1 };

			return await this.find("friends", query, projection);
		} catch (error) {
			throw error;
		}
	}
}

export const friendDao = new FriendDao();