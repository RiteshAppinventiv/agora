"use strict";

import { BaseDao } from "@dao/BaseDao";
import { toObjectId } from "@utils/appUtils";

export class RatingDao extends BaseDao {



	/**
	 * @function ratingList
	 */
	async ratingList(params, tokenData) {
		try {
			const aggPipe = [];

			const match: any = {};
			if (params.userId) {
				match.supporterId = toObjectId(params.userId);

			} else {
				match.supporterId = toObjectId(tokenData.userId);

			}

			aggPipe.push({

				"$lookup": {
					"from": "users",
					"let": { "participantId": "$participantId" },
					"pipeline": [
						{ "$match": { "$expr": { "$eq": ["$_id", "$$participantId"] } } },
						{ "$project": { "firstName": 1, "lastName": 1, "profilePicture": 1, "userType": 1 } }
						//{ "$project": { "name": 1 } }

					],
					"as": "participant_detail"
				}


			});

			aggPipe.push({

				"$lookup": {
					"from": "activities",
					"let": { "activityId": "$activityId" },
					"pipeline": [
						{ "$match": { "$expr": { "$eq": ["$_id", "$$activityId"] } } },
						{ "$project": { "activityType": 1 } }
						//{ "$project": { "name": 1 } }

					],
					"as": "activity_detail"
				}


			});



			aggPipe.push({ "$match": match });
			aggPipe.push({ "$sort": { createdAt: 1 } });
			aggPipe.push({ "$unwind": "$activity_detail" })
			aggPipe.push({ "$unwind": "$participant_detail" })
			//aggPipe.push({ "$group": { participantId: "$participantId" }, count: { $sum: 1 } })
			aggPipe.push({
				"$project": { _id: 1, rate: 1, "selectedTag": "$review", activityId: 1, description: 1, createdAt: 1, participant_detail: 1, activity_detail: 1 }
			})

			const options = { collation: true };

			let response = await this.paginate("ratings", aggPipe, params.limit, params.pageNo, options, false);
			//let counData = await this.aggregate("ratings", aggPipe, {});

			//response.total = counData.length;
			return response;
		} catch (error) {
			throw error;
		}
	}
}

export const ratingDao = new RatingDao();