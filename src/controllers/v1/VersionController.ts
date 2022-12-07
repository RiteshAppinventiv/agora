"use strict";

import { MESSAGES } from "@config/constant";
import { versionDaoV1 } from "@dao/index";;

export class VersionController {

	/**
	 * @function addVersion
	 */
	async addVersion(params: VersionRequest.Add) {
		try {
			const isExist = await versionDaoV1.isVersionExists(params);
			if (isExist) return Promise.reject(MESSAGES.ERROR.VERSION_ALREADY_EXIST);
			await versionDaoV1.addVersion(params);
			return MESSAGES.SUCCESS.ADD_VERSION;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function versionList
	 */
	async versionList(params: ListingRequest) {
		try {
			const step1 = await versionDaoV1.versionList(params);
			return MESSAGES.SUCCESS.LIST(step1);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteVersion
	 */
	async deleteVersion(params: VersionRequest.Id) {
		try {
			await versionDaoV1.deleteVersion(params);
			return MESSAGES.SUCCESS.DELETE_VERSION;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function versionDetails
	 */
	async versionDetails(params: VersionRequest.Id) {
		try {
			const step1 = await versionDaoV1.versionDetails(params);
			return MESSAGES.SUCCESS.DETAILS(step1);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editVersion
	 */
	async editVersion(params: VersionRequest.Edit) {
		try {
			const isExist = await versionDaoV1.isVersionExists(params);
			if (isExist) return Promise.reject(MESSAGES.ERROR.VERSION_ALREADY_EXIST);
			await versionDaoV1.editVersion(params);
			return MESSAGES.SUCCESS.EDIT_VERSION;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function versionCheck
	 */
	async versionCheck(params: VersionRequest.Check) {
		try {
			const step1 = await versionDaoV1.versionCheck(params);
			return MESSAGES.SUCCESS.DETAILS(step1);
		} catch (error) {
			throw error;
		}
	}
}

export const versionController = new VersionController();