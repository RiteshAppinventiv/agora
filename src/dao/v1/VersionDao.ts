"use strict";

import { BaseDao } from "@dao/BaseDao";
import { STATUS } from "@config/constant";
import { escapeSpecialCharacter } from "@utils/appUtils";

export class VersionDao extends BaseDao {

	/**
	  * @function isVersionExists
	  */
	async isVersionExists(params) {
		try {
			const query: any = {};
			query.status = { "$ne": STATUS.DELETED };
			query["$and"] = [
				{ updateType: params.updateType },
				{ platform: params.platform },
				{ currentVersion: params.currentVersion }
			];
			if (params.versionId) query._id = { "$not": { "$eq": params.versionId } };
			const projection = { _id: 1 };
			return await this.findOne("versions", query, projection);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function addVersion
	 */
	async addVersion(params: VersionRequest.Add) {
		try {
			return await this.save("versions", params);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function versionList
	 */
	async versionList(params: ListingRequest) {
		try {
			const aggPipe = [];

			const match: any = {};
			match.status = { "$ne": STATUS.DELETED };
			if (params.searchKey) {
				params.searchKey = escapeSpecialCharacter(params.searchKey);
				match.name = { "$regex": params.searchKey, "$options": "-i" };
			}
			aggPipe.push({ "$match": match });

			let sort = {};
			(params.sortBy && params.sortOrder) ? sort = { [params.sortBy]: params.sortOrder } : sort = { created: -1 };
			aggPipe.push({ "$sort": sort });

			aggPipe.push({ "$project": { updatedAt: 0, createdAt: 0 } });

			const options = { collation: true };
			return await this.paginate("versions", aggPipe, params.limit, params.pageNo, options, true);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteVersion
	 */
	async deleteVersion(params: VersionRequest.Id) {
		try {
			const query: any = {};
			query._id = params.versionId;

			const update = {};
			update["$set"] = {
				"status": STATUS.DELETED
			};

			return await this.updateOne("versions", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function versionDetails
	 */
	async versionDetails(params: VersionRequest.Id) {
		try {
			const query: any = {};
			query._id = params.versionId;

			const projection = { updatedAt: 0, createdAt: 0 };

			return await this.findOne("versions", query, projection);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editVersion
	 */
	async editVersion(params: VersionRequest.Edit) {
		try {
			const query: any = {};
			query._id = params.versionId;

			const update = {};
			update["$set"] = params;

			return await this.updateOne("versions", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function versionCheck
	 * @author Suraj Sharma
	 */
	async versionCheck(params: VersionRequest.Check) {
		try {
			const query: any = {};
			query.currentVersion = { "$gt": params.currentVersion };
			query.platform = params.platform;
			query.status = STATUS.UN_BLOCKED;

			const projection = {
				"_id": 0,
				"name": 0,
				"status": 0,
				"created": 0,
				"platform": 0,
				"createdAt": 0,
				"updatedAt": 0
			};

			return await this.findOne("versions", query, projection, {});
		} catch (error) {
			throw error;
		}
	}
}

export const versionDao = new VersionDao();