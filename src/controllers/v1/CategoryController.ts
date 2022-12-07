"use strict";

import { MESSAGES, STATUS, USER_TYPE } from "@config/constant";
import { baseDao, categoryDaoV1 } from "@dao/index";

export class CategoryController {

	/**
	 * @function addCategory
	 */
	async addCategory(params: CategoryRequest.Add) {
		try {
			const isExist = await categoryDaoV1.isCategoryExists(params);
			if (isExist) return Promise.reject(MESSAGES.ERROR.CATEGORY_ALREADY_EXIST);
			await categoryDaoV1.addCategory(params);
			return MESSAGES.SUCCESS.ADD_CATEGORY;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function categoryList
	 */
	async categoryList(params: ListingRequest, tokenData: TokenData) {
		try {
			const data = await categoryDaoV1.categoryList(params, tokenData.userType);
			if (tokenData.userType === USER_TYPE.ADMIN) {
				if (!params.pageNo || !params.limit) return Promise.reject(MESSAGES.ERROR.FIELD_REQUIRED("Page no & limit"));
				return MESSAGES.SUCCESS.LIST(data);
			} else {
				return MESSAGES.SUCCESS.LIST({ data });
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteCategory
	 */
	async deleteCategory(params: CategoryRequest.Delete) {
		try {
			const isExist = await categoryDaoV1.categoryDetails(params, { _id: 1 });
			if (!isExist) return Promise.reject(MESSAGES.ERROR.CATEGORY_NOT_FOUND);

			if (params.status !== STATUS.UN_BLOCKED) {
				// const count1 = await baseDao.countDocuments("users", { "interests._id": params.categoryId });
				// const count2 = await baseDao.countDocuments("activities", { "interestId._id": params.categoryId });
				// if ((count1 || count2) && params.status === STATUS.BLOCKED) return Promise.reject(MESSAGES.ERROR.CANT_BLOCK_CATEGORY);
			}
			await categoryDaoV1.deleteCategory(params);
			switch (params.status) {
				case STATUS.BLOCKED:
					return MESSAGES.SUCCESS.BLOCK_CATEGORY;
				case STATUS.UN_BLOCKED:
					return MESSAGES.SUCCESS.UNBLOCK_CATEGORY;
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function categoryDetails
	 */
	async categoryDetails(params: CategoryRequest.Id) {
		try {
			const step1 = await categoryDaoV1.categoryDetails(params);
			if (!step1) return Promise.reject(MESSAGES.ERROR.CATEGORY_NOT_FOUND);
			return MESSAGES.SUCCESS.DETAILS(step1);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editCategory
	 */
	async editCategory(params: CategoryRequest.Edit) {
		try {
			const step1 = await categoryDaoV1.categoryDetails(params, { _id: 1 });
			if (!step1) return Promise.reject(MESSAGES.ERROR.CATEGORY_NOT_FOUND);

			const isExist = await categoryDaoV1.isCategoryExists(params);
			if (isExist) return Promise.reject(MESSAGES.ERROR.CATEGORY_ALREADY_EXIST);
			await categoryDaoV1.editCategory(params);
			return MESSAGES.SUCCESS.EDIT_CATEGORY;
		} catch (error) {
			throw error;
		}
	}
	/**     
	 * @function categoryViewMore
	 */
	async categoryViewMore(params: CategoryRequest.Text, tokenData) {
		try {
			const step1 = await categoryDaoV1.categoryViewMore(params);
			if (!step1) return Promise.reject(MESSAGES.ERROR.CATEGORY_NOT_FOUND);
			return MESSAGES.SUCCESS.LIST(step1);
		} catch (error) {
			throw error;
		}
	}
}

export const categoryController = new CategoryController();