"use strict";

import { BaseDao } from "@dao/BaseDao";
import { STATUS } from "@config/constant";
import { escapeSpecialCharacter, toObjectId } from "@utils/appUtils";
export class AdminDao extends BaseDao {

	/**
	 * @function isEmailExists
	 */
	async isEmailExists(params, userId?: string) {
		try {
			const query: any = {};
			query.email = params.email;
			if (userId) query._id = { "$not": { "$eq": userId } };
			query.status = { "$ne": STATUS.DELETED };

			const projection = { updatedAt: 0 };

			return await this.findOne("admins", query, projection);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function findAdminById
	 */
	async findAdminById(userId: string, project = {}) {
		try {
			const query: any = {};
			query._id = userId;
			query.status = { "$ne": STATUS.DELETED };

			const projection = (Object.values(project).length) ? project : { createdAt: 0, updatedAt: 0 };

			return await this.findOne("admins", query, projection);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function createAdmin
	 */
	async createAdmin(params: AdminRequest.Create) {
		try {
			return await this.save("admins", params);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function emptyForgotToken
	 */
	async emptyForgotToken(params) {
		try {
			const query: any = {};
			if (params.token) query.forgotToken = params.token;
			if (params.userId) query._id = params.userId;

			const update = {};
			update["$unset"] = {
				"forgotToken": ""
			};

			return await this.updateOne("admins", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function changePassword   
	 */
	async changePassword(params, userId?: string) {
		try {
			const query: any = {};
			if (userId) query._id = userId;
			if (params.email) query.email = params.email;

			const update = {};
			update["$set"] = {
				"hash": params.hash
			};

			return await this.updateOne("admins", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editProfile
	 */
	async editProfile(params: AdminRequest.EditProfile, userId: string) {
		try {
			const query: any = {};
			query._id = userId;

			const update = {};
			update["$set"] = params;
			const options = { new: true };

			return await this.findOneAndUpdate("admins", query, update, options);
		} catch (error) {
			throw error;
		}
	}


	/**
	  * @function timeSheetHistory
	  * @description 
	  */
	async timeSheetHistory(params: UserRequest.TimeSHeetHistory, tokenData) {
		try {
			const aggPipe = [];
			const match: any = {};
			aggPipe.push({ "$unwind": "$attendees" });
			match['attendees._id'] = toObjectId(params.userId)
			match['attendees.status'] = { "$ne": STATUS.CANCELLED.TYPE }
			if (params.type == STATUS.ONGOING) {
				match['status'] = STATUS.ONGOING

			}
			if (params.type == STATUS.UPCOMING) {
				match['status'] = STATUS.PENDING.TYPE

			}
			aggPipe.push({ "$match": match });
			aggPipe.push({ "$sort": { createdAt: -1 } });

			aggPipe.push({
				"$project": {

					activityType: 1,
					//details: 1,
					attendees: 1,
					startTime: 1,
					shiftEndTime: 1,
					endTime: 1,
					createdAt: 1

				}
			});


			const response: any = await this.paginate("activities", aggPipe, params.limit, params.pageNo, {});
			let counData = await this.aggregate("activities", aggPipe, {});

			response.total = counData.length;


			return response;
		} catch (error) {
			throw error;
		}
	}
}

export const adminDao = new AdminDao();