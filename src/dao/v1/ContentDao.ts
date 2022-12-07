"use strict";

import { BaseDao } from "@dao/BaseDao";
import { CONTENT_TYPE, STATUS } from "@config/constant";

export class ContentDao extends BaseDao {

	/**
	 * @function isFaqExist
	 */
	async isFaqExist(params) {
		try {
			const query: any = {};
			query.question = params.question;
			query.status = { "$ne": STATUS.DELETED };
			query.type = CONTENT_TYPE.FAQ;
			if (params.faqId) query._id = { "$not": { "$eq": params.faqId } };
			const projection = { _id: 1 };

			return await this.findOne("contents", query, projection);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteContent
	 */
	async deleteContent(params: ContentRequest.Id) {
		try {
			const query: any = {};
			query._id = params.contentId;

			const update = {};
			update["$set"] = {
				"status": STATUS.DELETED
			};

			return await this.updateOne("contents", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function contentDetails
	 */
	async contentDetails(params: ContentRequest.Type) {
		try {
			const query: any = {};
			query.type = params.type;

			const projection = { _id: 1, data: 1, type: 1, created: 1 };

			return await this.findOne("contents", query, projection);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editContent
	 */
	async editContent(params: ContentRequest.Edit) {
		try {
			const query: any = {};
			query.type = params.type;

			const update = {};
			update["$set"] = {
				"data": params.data
			};
			// Create If not exist.
			const options = { upsert: true, new: true };
			return await this.update("contents", query, update, options);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function addFaq
	 */
	async addFaq(params: ContentRequest.AddFaq) {
		try {
			params.type = CONTENT_TYPE.FAQ;
			return await this.save("contents", params);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function faqList
	 */
	async faqList(params: ListingRequest) {
		try {
			const aggPipe = [];

			const match: any = {};
			match.type = CONTENT_TYPE.FAQ;
			aggPipe.push({ "$match": match });

			const project = { id: 1, question: 1, answer: 1, created: 1, position: 1 };
			aggPipe.push({ "$project": project });

			aggPipe.push({ "$sort": { position: 1 } });

			return this.paginate("contents", aggPipe, params.limit, params.pageNo, {}, true);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editFaq
	 */
	async editFaq(params: ContentRequest.EditFaq) {
		try {
			const query: any = {};
			query._id = params.faqId;

			const update = {};
			update["$set"] = {
				"answer": params.answer,
				"question": params.question
			};
			if (params.position) update["$set"]["position"] = params.position;

			return await this.updateOne("contents", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function deleteFaq
	 */
	async deleteFaq(params: ContentRequest.FaqId) {
		try {
			const query: any = {};
			query._id = params.faqId;

			return await this.remove("contents", query);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function faqDetails
	 */
	async faqDetails(params: ContentRequest.FaqId) {
		try {
			const query: any = {};
			query._id = params.faqId;

			const projection = { _id: 1, question: 1, answer: 1, type: 1, created: 1, position: 1 };

			return await this.findOne("contents", query, projection);
		} catch (error) {
			throw error;
		}
	}

	/**
	  * @function viewContent
	  */
	async viewContent(params: ContentRequest.View) {
		try {
			const aggPipe = [];
			const match: any = {};
			match.type = params.type;
			aggPipe.push({ "$match": match });

			let project = {};
			if (params.type === CONTENT_TYPE.FAQ) {
				project = { _id: 1, question: 1, answer: 1, position: 1 };
				aggPipe.push({ "$sort": { position: 1 } });
			} else
				project = { _id: 1, data: 1 };
			aggPipe.push({ "$project": project });

			return await this.aggregate("contents", aggPipe, {});
		} catch (error) {
			throw error;
		}
	}
}

export const contentDao = new ContentDao();