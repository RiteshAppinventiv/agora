"use strict";

import * as _ from "lodash";

import { MESSAGES, STATUS, USER_TYPE } from "@config/index";
import { adminDaoV1, rolesDaoV1 } from "@dao/index";
//import * as appUtils from "@utils/appUtils";
import { MailManager } from "@lib/MailManager";
const mailManager = new MailManager();

export class RoleController {

	/**
	 * @function createRole
	 */
	async createRole(params: RoleRequest.CreateRole, tokenData: TokenData) {
		try {
			if (tokenData.userType === USER_TYPE.ADMIN) {
				let role = await rolesDaoV1.isRoleExist(params.role);
				if (role) {
					return Promise.reject(MESSAGES.ERROR.ROLE_ALREADY_EXIST);
				}
				let step1 = await rolesDaoV1.createRole(params);
				return MESSAGES.SUCCESS.ROLE_CREATED(step1);
			} else {
				return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
			}
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * @function editRole
	 */
	async editRole(params: RoleRequest.EditRole, tokenData: TokenData) {
		try {
			if (tokenData.userType === USER_TYPE.ADMIN) {
				if (params.role) {
					let role = await rolesDaoV1.isRoleExist(params.role);
					if (role && params.roleId.toString() !== role._id.toString()) {
						return Promise.reject(MESSAGES.ERROR.ROLE_ALREADY_EXIST);
					}
				}
				let step1 = await rolesDaoV1.editRole(params);
				return MESSAGES.SUCCESS.ROLE_EDITED(step1);
			} else {
				return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
			}
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * @function blockRole
	 */
	async blockRole(params: RoleRequest.BlockUnblockRole, tokenData: TokenData) {
		try {
			if (tokenData.userType === USER_TYPE.ADMIN) {
				// let step1 = await rolesDaoV1.blockRole(params);
				// if (params.status === STATUS.BLOCKED) {
				// 	let step2 = await rolesDaoV1.blockRoleSubadmin(params);
				// }
				// switch (params.status) {
				// 	case STATUS.BLOCKED:
				// 		return MESSAGES.SUCCESS.ROLE_BLOCKED;
				// 	case STATUS.UN_BLOCKED:
				// 		return MESSAGES.SUCCESS.ROLE_UNBLOCKED;
				// };
			} else {
				return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
			}
		} catch (error) {
			throw (error);
		}
	}
	/**
	 * @function deleteRole
	 */
	async deleteRole(params: RoleRequest.RoleId, tokenData: TokenData) {
		try {
			if (tokenData.userType === USER_TYPE.ADMIN) {
				let step1 = await rolesDaoV1.deleteRole(params);
				let step2 = await rolesDaoV1.deleteRoleSubadmin(params);
				return MESSAGES.SUCCESS.ROLE_DELETED;
			} else {
				return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
			}
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * @function roleList
	 */
	async roleList(params: ListingRequest, tokenData: TokenData) {
		try {
			if (tokenData.userType === USER_TYPE.ADMIN) {
				let step1 = await rolesDaoV1.roleList(params);
				return MESSAGES.SUCCESS.ROLE_LIST(step1);
			} else {
				return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
			}
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * @function roleDetails
	 */
	async roleDetails(params: RoleRequest.RoleId, tokenData: TokenData) {
		try {
			if (tokenData.userType === USER_TYPE.ADMIN) {
				let step1 = await rolesDaoV1.roleDetails(params);
				return MESSAGES.SUCCESS.ROLE_DETAILS(step1);
			} else {
				return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
			}
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * @function createSubAdmin
	 */
	async createSubAdmin(params: RoleRequest.CreateSubAdmin, tokenData: TokenData) {
		try {
			if (tokenData.userType === USER_TYPE.ADMIN) {
				let step1 = await adminDaoV1.isEmailExists(params);
				if (step1) {
					return Promise.reject(MESSAGES.ERROR.EMAIL_ALREADY_EXIST);
				}
				let step2 = await rolesDaoV1.findRoleById(params.roleId);
				if (!step2) {
					return Promise.reject(MESSAGES.ERROR.INVALID_ROLE_ID);
				}
				//params.password = appUtils.genPassword(10);
				let step3 = await rolesDaoV1.createSubAdmin({
					name: params.name,
					email: params.email,
					roleId: params.roleId,
					userType: USER_TYPE.SUB_ADMIN,
					password: params.password
				});
				//await mailManager.subAdminPasswordMail({ email: params.email, password: params.password, userName: params.name })
				return MESSAGES.SUCCESS.SUB_ADMIN_CREATED;
			} else {
				return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
			}
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * @function editSubAdmin
	 */
	async editSubAdmin(params: RoleRequest.EditSubAdmin, tokenData: TokenData) {
		try {
			if (tokenData.userType === USER_TYPE.ADMIN) {
				let step1 = await rolesDaoV1.findSubAdminById({ "userId": params.adminId });
				if (!step1) {
					return Promise.reject(MESSAGES.ERROR.INVALID_SUB_ADMIN);
				}
				if (params.roleId) {
					let step3 = await rolesDaoV1.findRoleById(params.roleId);
					if (!step3) {
						return Promise.reject(MESSAGES.ERROR.INVALID_ROLE_ID);
					}
				}
				let step4 = await rolesDaoV1.editSubAdmin(params);
				return MESSAGES.SUCCESS.SUB_ADMIN_EDITED;
			} else {
				return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
			}
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * @function blockUnblockSubAdmin
	 */
	async blockUnblockSubAdmin(params: RoleRequest.BlockSubAdmin, tokenData: TokenData) {
		try {
			if (tokenData.userType === USER_TYPE.ADMIN) {
				//if (params.status === STATUS.UN_BLOCKED) {
				let subadmin = await rolesDaoV1.findSubAdminById({ "userId": params.adminId });
				if (!subadmin) {
					return Promise.reject(MESSAGES.ERROR.INVALID_SUB_ADMIN);
				}
				if (subadmin.roleId) {
					let role = await rolesDaoV1.findRoleById(subadmin.roleId);
					if (!role || role.status === STATUS.BLOCKED) {
						return Promise.reject(MESSAGES.ERROR.ROLE_IS_BLOCKED);
					}
				}
				//}
				let step1 = await rolesDaoV1.blockUnblockSubAdmin(params);
				switch (params.status) {
					// case STATUS.BLOCKED:
					// 	return MESSAGES.SUCCESS.SUB_ADMIN_BLOCKED;
					// case STATUS.UN_BLOCKED:
					// 	return MESSAGES.SUCCESS.SUB_ADMIN_UNBLOCKED;
				};
			} else {
				return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
			}
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * @function deleteSubAdmin
	 */
	async deleteSubAdmin(params: RoleRequest.AdminId, tokenData: TokenData) {
		try {
			if (tokenData.userType === USER_TYPE.ADMIN) {
				let step1 = await rolesDaoV1.deleteSubAdmin(params);
				return MESSAGES.SUCCESS.SUB_ADMIN_DELETED;
			} else {
				return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
			}
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * @function subAdminList
	 */
	async subAdminList(params: RoleRequest.SubAdminList, tokenData: TokenData) {
		try {
			if (tokenData.userType === USER_TYPE.ADMIN) {
				let step1 = await rolesDaoV1.subAdminList(params);
				return MESSAGES.SUCCESS.SUB_ADMIN_LIST(step1);
			} else {
				return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
			}
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * @function subAdminDetails
	 */
	async subAdminDetails(params: RoleRequest.AdminId, tokenData: TokenData) {
		try {
			if (tokenData.userType === USER_TYPE.ADMIN) {
				let step1 = await rolesDaoV1.subAdminDetails(params);
				if (step1.roleId) {
					let step2 = await rolesDaoV1.findRoleById(step1.roleId);
					if (step2) {
						step1.role = step2.role;
						step1.permission = step2.permission;
					}
				}
				return MESSAGES.SUCCESS.SUB_ADMIN_DETAILS(step1);
			} else {
				return Promise.reject(MESSAGES.ERROR.INVALID_ADMIN);
			}
		} catch (error) {
			throw (error);
		}
	}

}

export let roleController = new RoleController();