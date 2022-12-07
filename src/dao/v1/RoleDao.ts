"use strict";

import * as _ from "lodash";
import { BaseDao } from "@dao/BaseDao";
import { STATUS, USER_TYPE } from "@config/index";
import * as mongoose from "mongoose";

export class RoleDao extends BaseDao {

	/**
	 * @function createRole
	 */
	async createRole(params: RoleRequest.CreateRole) {
		try {
			return await this.save("roles", params);
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * @function isRoleExist
	 */
	async isRoleExist(role: string) {
		try {
			const query: any = {};
			query.status = { "$ne": STATUS.DELETED };
			query.role = { "$regex": new RegExp("^" + role + "$", "i") };
			const projection = { updatedAt: 0 };
			const options: any = { lean: true };

			return await this.findOne("roles", query, projection, options);
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * @function editRole
	 */
	async editRole(params: RoleRequest.EditRole) {
		try {
			const query: any = {};
			query._id = mongoose.Types.ObjectId(params.roleId);
			const update = {};
			update["$set"] = params;
			const options: any = { new: true };
			return await this.findOneAndUpdate("roles", query, update, options);
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * @function blockRole
	 */
	async blockRole(params: RoleRequest.BlockUnblockRole) {
		try {
			const query: any = {};
			query._id = mongoose.Types.ObjectId(params.roleId);
			query.status = { "$ne": STATUS.DELETED };
			const update = {};
			update["$set"] = {
				status: params.status
			};
			const options: any = {};
			return await this.updateOne("roles", query, update, options);
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * @function blockRoleSubadmin
	 */
	async blockRoleSubadmin(params: RoleRequest.BlockUnblockRole) {
		try {
			const query: any = {};
			query.roleId = mongoose.Types.ObjectId(params.roleId);
			query.status = { "$ne": STATUS.DELETED };
			const update = {};
			update["$set"] = {
				status: params.status
			};
			const options: any = { multi: true, runValidators: true };
			return await this.updateMany("admins", query, update, options);
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * @function deleteRole
	 */
	async deleteRole(params: RoleRequest.RoleId) {
		try {
			const query: any = {};
			query._id = mongoose.Types.ObjectId(params.roleId);
			query.status = { "$ne": STATUS.DELETED };
			const update = {};
			update["$set"] = {
				status: STATUS.DELETED
			};
			const options: any = {};
			return await this.updateOne("roles", query, update, options);
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * @function deleteRoleSubadmin
	 */
	async deleteRoleSubadmin(params: RoleRequest.RoleId) {
		try {
			const query: any = {};
			query.roleId = mongoose.Types.ObjectId(params.roleId);
			query.status = { "$ne": STATUS.DELETED };
			const update = {};
			update["$set"] = {
				status: STATUS.DELETED
			};
			const options: any = { multi: true, runValidators: true };
			return await this.updateMany("admins", query, update, options);
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * @function roleList
	 */
	async roleList(params: ListingRequest) {
		try {
			let { pageNo, limit, searchKey, sortBy, sortOrder, status, fromDate, toDate } = params;
			const aggPipe = [];

			const match: any = {};
			match.status = { "$ne": STATUS.DELETED };
			if (status) {
				match.status = { "$eq": status };
			}
			if (fromDate || toDate) {
				match.createdAt = { "$gte": fromDate ? fromDate : Date.now, "$lte": toDate ? toDate : Date.now };
			}
			if (searchKey) {
				match["$or"] = [
					{ "role": { "$regex": new RegExp(searchKey, "i") } },
				];
			}
			aggPipe.push({ "$match": match });

			let project: any = {
				_id: 1,
				role: 1,
				permission: 1,
				status: 1,
				createdAt: 1,
				updatedAt: 1,
			};
			aggPipe.push({ "$project": project });

			let sort: any = {};
			(sortBy && sortOrder) ? sort = { [sortBy]: sortOrder } : sort = { "createdAt": -1 };
			aggPipe.push({ "$sort": sort });

			return await this.paginate("roles", aggPipe, limit, pageNo, {}, true);
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * @function roleDetails
	 */
	async roleDetails(params: RoleRequest.RoleId) {
		try {
			const query: any = {};
			query._id = mongoose.Types.ObjectId(params.roleId);

			const projection = { updatedAt: 0 };
			const options: any = { lean: true };

			return await this.findOne("roles", query, projection, options);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function findRoleById
	 */
	async findRoleById(roleId: string) {
		try {
			const query: any = {};
			query._id = mongoose.Types.ObjectId(roleId);
			query.status = { "$ne": STATUS.DELETED };
			const projection = { updatedAt: 0 };
			const options: any = { lean: true };

			return await this.findOne("roles", query, projection, options);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function createSubAdmin
	 */
	async createSubAdmin(params: RoleRequest.CreateSubAdmin) {
		try {
			return await this.save("admins", params);
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * @function editSubAdmin
	 * @author shivam singhal
	 */
	async editSubAdmin(params: RoleRequest.EditSubAdmin) {
		try {
			const query: any = { _id: mongoose.Types.ObjectId(params.adminId) };
			const update: any = { "$set": params };
			const options = {};
			await this.updateOne("admins", query, update, options);
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * @function blockUnblockSubAdmin
	 */
	async blockUnblockSubAdmin(params: RoleRequest.BlockSubAdmin) {
		try {
			const query: any = {};
			query._id = mongoose.Types.ObjectId(params.adminId);
			query.status = { "$ne": STATUS.DELETED };
			const update = {};
			update["$set"] = {
				status: params.status
			};
			const options: any = {};
			return await this.updateOne("admins", query, update, options);
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * @function deleteSubAdmin
	 */
	async deleteSubAdmin(params: RoleRequest.AdminId) {
		try {
			const query: any = {};
			query._id = mongoose.Types.ObjectId(params.adminId);
			const update = {};
			update["$set"] = {
				status: STATUS.DELETED
			};
			const options: any = {};
			return await this.updateOne("admins", query, update, options);
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * @function subAdminList
	 */
	async subAdminList(params: RoleRequest.SubAdminList) {
		try {
			let { pageNo, limit, searchKey, sortBy, sortOrder, status, fromDate, toDate, roleId } = params;
			const aggPipe = [];

			const match: any = {};
			match.userType = { "$eq": USER_TYPE.SUB_ADMIN };
			match.status = { "$ne": STATUS.DELETED };
			if (status) {
				match.status = { "$eq": status };
			}
			if (fromDate || toDate) {
				match.createdAt = { "$gte": fromDate ? fromDate : Date.now, "$lte": toDate ? toDate : Date.now };
			}
			if (roleId) {
				match.roleId = mongoose.Types.ObjectId(roleId);
			}
			if (searchKey) {
				match["$or"] = [
					{ "name": { "$regex": new RegExp(searchKey, "i") } },
					{ "email": { "$regex": new RegExp(searchKey, "i") } },
				];
			}
			aggPipe.push({ "$match": match });

			const lookup: any = {
				from: "roles",
				localField: "roleId",
				foreignField: "_id",
				as: "roleData"
			}
			aggPipe.push({ "$lookup": lookup });
			aggPipe.push({
				'$unwind': {
					"path": "$roleData",
					"preserveNullAndEmptyArrays": true
				}
			});
			let project: any = {
				_id: 1,
				name: 1,
				email: 1,
				status: 1,
				createdAt: 1,
				updatedAt: 1,
				roleId: 1,
				role: "$roleData.role",
			};
			aggPipe.push({ "$project": project });

			let sort: any = {};
			(sortBy && sortOrder) ? sort = { [sortBy]: sortOrder } : sort = { "createdAt": -1 };
			aggPipe.push({ "$sort": sort });

			return await this.paginate("admins", aggPipe, limit, pageNo, {}, true);
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * @function findSubAdminById
	 */
	async findSubAdminById(params: UserId) {
		try {
			const query: any = {};
			query._id = mongoose.Types.ObjectId(params.userId);
			query.status = { "$ne": STATUS.DELETED };
			query.userType = { "$eq": USER_TYPE.SUB_ADMIN };

			const projection = { updatedAt: 0 };
			const options: any = { lean: true };

			return await this.findOne("admins", query, projection, options);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function subAdminDetails
	 */
	async subAdminDetails(params: RoleRequest.AdminId) {
		try {
			const query: any = {};
			query._id = mongoose.Types.ObjectId(params.adminId);
			query.userType = { "$eq": USER_TYPE.SUB_ADMIN };

			const projection = {
				_id: 1,
				name: 1,
				email: 1,
				status: 1,
				createdAt: 1,
				updatedAt: 1,
				roleId: 1
			};
			const options: any = { lean: true };

			return await this.findOne("admins", query, projection, options);
		} catch (error) {
			throw error;
		}
	}

}

export let roleDao = new RoleDao();