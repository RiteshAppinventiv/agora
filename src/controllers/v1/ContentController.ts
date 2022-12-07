"use strict";

import { CONTENT_TYPE, MESSAGES } from "@config/constant";
import { baseDao, contentDaoV1 } from "@dao/index";

export class ContentController {

	/**
	 * @function contentDetails
	 */
	async contentDetails(params: ContentRequest.Type) {
		try {
			const step1 = await contentDaoV1.contentDetails(params);
			return MESSAGES.SUCCESS.DETAILS(step1);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editContent
	 */
	async editContent(params: ContentRequest.Edit) {
		try {
			await contentDaoV1.editContent(params);
			return MESSAGES.SUCCESS.EDIT_CONTENT;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function viewContent
	 */
	async viewContent(params: ContentRequest.View) {
		try {
			let step1 = await contentDaoV1.viewContent(params);
			if (params.type !== CONTENT_TYPE.FAQ) step1 = step1[0];
			return MESSAGES.SUCCESS.DETAILS(step1);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function addFaq
	 */
	async addFaq(params: ContentRequest.AddFaq) {
		try {
			const isExist = await contentDaoV1.isFaqExist(params);
			if (isExist) return Promise.reject(MESSAGES.ERROR.FAQ_ALREADY_EXIST);
			const faqCount = await baseDao.countDocuments("contents", { type: CONTENT_TYPE.FAQ });
			const faqPosition = await baseDao.findOne("contents", { "type": CONTENT_TYPE.FAQ, "position": params.position }, { _id: 1 });
			if (faqPosition && params.position <= faqCount) await this.increaseFaqPosition(params);
			await contentDaoV1.addFaq(params);
			return MESSAGES.SUCCESS.ADD_CONTENT;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function faqList
	 */
	async faqList(params: ListingRequest) {
		try {
			const step1 = await contentDaoV1.faqList(params);
			return MESSAGES.SUCCESS.LIST(step1);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editFaq
	 */
	async editFaq(params: ContentRequest.EditFaq) {
		try {
			const isExist = await contentDaoV1.isFaqExist(params);
			if (isExist) return Promise.reject(MESSAGES.ERROR.FAQ_ALREADY_EXIST);
			const faqDetails = await contentDaoV1.faqDetails(params);
			const faqCount = await baseDao.countDocuments("contents", { "type": CONTENT_TYPE.FAQ });
			if (params.position !== faqDetails.position || params.position <= faqCount) {
				if (faqDetails && params.position > faqDetails.position) {
					await this.decreaseFaqPosition(params, faqDetails);
				} else if (faqDetails && params.position <= faqDetails.position) {
					await this.increaseFaqPosition(params, faqDetails)
					await this.decreaseFaqPosition(params, faqDetails);
				}
			}
			await contentDaoV1.editFaq(params);
			return MESSAGES.SUCCESS.EDIT_CONTENT;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteFaq
	 */
	async deleteFaq(params: ContentRequest.FaqId) {
		try {
			await contentDaoV1.deleteFaq(params);
			return MESSAGES.SUCCESS.DELETE_FAQ;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function faqDetails
	 */
	async faqDetails(params: ContentRequest.FaqId) {
		try {
			const step1 = await contentDaoV1.faqDetails(params);
			return MESSAGES.SUCCESS.DETAILS(step1);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function increaseFaqPosition
	 */
	async increaseFaqPosition(params: ContentRequest.AddFaq, faqDetails?: ContentRequest.AddFaq) {
		try {
			const query: any = {};
			query.type = CONTENT_TYPE.FAQ;
			if (faqDetails)
				query.position = { "$lt": faqDetails.position, "$gte": params.position };
			else
				query.position = { "$gte": params.position };

			const update = {};
			update["$inc"] = { position: 1 };

			return await baseDao.updateMany("contents", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function decreaseFaqPosition
	 */
	async decreaseFaqPosition(params: ContentRequest.EditFaq, faqDetails: ContentRequest.EditFaq) {
		try {
			const query: any = {};
			query.type = CONTENT_TYPE.FAQ;
			query.position = { "$gt": faqDetails.position, "$lte": params.position };

			const update = {};
			update["$inc"] = { position: -1 };

			return await baseDao.updateMany("contents", query, update, {});
		} catch (error) {
			throw error;
		}
	}
}

export const contentController = new ContentController();