"use strict";

import { BaseDao } from "@dao/BaseDao";
import { STATUS, USER_TYPE } from "@config/constant";
import { escapeSpecialCharacter } from "@utils/appUtils";

export class CategoryDao extends BaseDao {

	/**
	 * @function isCategoryExists
	 */
	async isCategoryExists(params) {
		try {
			const query: any = {};
			query.lowercaseName = params.name.toLowerCase();
			if (params.categoryId) query._id = { "$ne": params.categoryId };

			const projection = { _id: 1, name: 1 };

			return await this.findOne("categories", query, projection);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function addCategory
	 */
	async addCategory(params: CategoryRequest.Add) {
		try {
			params.lowercaseName = params.name;
			return await this.save("categories", params);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function categoryList
	 */
	async categoryList(params: ListingRequest, userType: string) {
		try {
			const aggPipe = [];

			const match: any = {};
			if (params.status) match.status = params.status;
			if (userType === USER_TYPE.PARTICIPANT || userType === USER_TYPE.SUPPORTER) match.status = STATUS.UN_BLOCKED;
			if (params.searchKey) {
				params.searchKey = escapeSpecialCharacter(params.searchKey);
				match.name = { "$regex": params.searchKey, "$options": "-i" };
			}
			if (Object.keys(match).length) aggPipe.push({ "$match": match });

			if (userType === USER_TYPE.ADMIN)
				aggPipe.push({ "$project": { _id: 1, name: 1, image: 1, status: 1, created: 1 ,type:1} });
			else
				aggPipe.push({ "$project": { _id: 1, name: 1, image: 1 } });

			let sort = {};
			(params.sortBy && params.sortOrder) ? sort = { [params.sortBy]: params.sortOrder } : sort = { created: -1 };
			aggPipe.push({ "$sort": sort });

			const options = { collation: true };

			if (userType === USER_TYPE.ADMIN)
				return await this.paginate("categories", aggPipe, params.limit, params.pageNo, options, true);
			else
				return await this.aggregate("categories", aggPipe, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteCategory
	 */
	async deleteCategory(params: CategoryRequest.Delete) {
		try {
			const query: any = {};
			query._id = params.categoryId;

			const update = {};
			update["$set"] = {
				"status": params.status
			};

			return await this.updateOne("categories", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function categoryDetails
	 */
	async categoryDetails(params: CategoryRequest.Id, project = {}) {
		try {
			const query: any = {};
			query._id = params.categoryId;

			const projection = (Object.values(project).length) ? project : { createdAt: 0, updatedAt: 0 };

			return await this.findOne("categories", query, projection);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editCategory
	 */
	async editCategory(params: CategoryRequest.Edit) {
		try {
			const query: any = {};
			query._id = params.categoryId;

			const update = {};
			params.lowercaseName = params.name;
			update["$set"] = params;
			const options = { new: true };

			return await this.findOneAndUpdate("categories", query, update, options);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function categoryViewMore
	 */
	async categoryViewMore(params: CategoryRequest.Text, project = {}) {
		try {
			const aggPipe = [];
			const match: any = {};
			match.status = STATUS.UN_BLOCKED
			aggPipe.push({ "$match": match })
			if (params.searchKey) {
				params.searchKey = escapeSpecialCharacter(params.searchKey);
				match.name = { "$regex": params.searchKey, "$options": "-i" };
			}
			aggPipe.push({
				"$project": { _id: 1, name: 1, image: 1 }
			});

			const options = { collation: true };

			return await this.paginate("categories", aggPipe, params.limit, params.pageNo, options);

		} catch (error) {
			throw error;
		}
	}
}

export const categoryDao = new CategoryDao();