"use strict";

import * as _ from "lodash";

import { BaseDao } from "@dao/BaseDao";
import { DISTANCE_MULTIPLIER, GRAPH_TYPE, STATUS, UPDATE_TYPE, FRIEND_REQUEST_STATUS } from "@config/constant";
import { escapeSpecialCharacter, toObjectId } from "@utils/appUtils";

export class UserDao extends BaseDao {

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

			return await this.findOne("users", query, projection);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function isMobileExists
	 */
	async isMobileExists(params, userId?: string) {
		try {
			const query: any = {};
			query.countryCode = params.countryCode;
			query.mobileNo = params.mobileNo;
			if (userId) query._id = { "$not": { "$eq": userId } };
			query.status = { "$ne": STATUS.DELETED };

			const projection = { _id: 1 };

			return await this.findOne("users", query, projection);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function signUp
	 */
	async signUp(params: UserRequest.SignUp, session?) {
		try {
			return await this.save("users", params, { session });
		} catch (error) {
			throw error;
		}
	}

	/**    
	 * @function findUserById
	 */
	async findUserById(userId: string, project = {}) {
		try {
			const query: any = {};
			query._id = userId;
			query.status = { "$ne": STATUS.DELETED };

			const projection = (Object.values(project).length) ? project : { createdAt: 0, updatedAt: 0 };

			return await this.findOne("users", query, projection);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function changePassword   
	 */
	async changePassword(params: UserRequest.ChangeForgotPassword) {
		try {
			const query: any = {};
			query.email = params.email;

			const update = {};
			update["$set"] = {
				hash: params.hash
			};

			return await this.updateOne("users", query, update, {});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function userList
	 */
	async userList(params: AdminRequest.UserListing) {
		try {
			const aggPipe = [];

			aggPipe.push({
				"$project": {
					_id: 1, userType: 1, name: 1, email: 1, profilePicture: 1, onboardingProgress: 1, isApproved: 1, status: 1,
					created: 1, ndisNumber: { "$convert": { input: "$ndisPlanDetails.number", to: "string" } }, createdAt: 1
				}
			});

			const match: any = {};
			if (params.userType) match.userType = params.userType;
			if (params.searchKey) {
				params.searchKey = escapeSpecialCharacter(params.searchKey);
				match["$or"] = [
					{ name: { "$regex": params.searchKey, "$options": "-i" } },
					{ email: { "$regex": params.searchKey, "$options": "-i" } },
					{ ndisNumber: { "$regex": params.searchKey, "$options": "-i" } }
				];
			}
			if (params.status)
				match.status = params.status;
			else
				match.status = { "$ne": STATUS.DELETED };
			if (params.fromDate && !params.toDate) match.created = { "$gte": params.fromDate };
			if (params.toDate && !params.fromDate) match.created = { "$lte": params.toDate };
			if (params.fromDate && params.toDate) match.created = { "$gte": params.fromDate, "$lte": params.toDate };
			if (params.latestUsers) match.createdAt = { "$gte": new Date(new Date().setHours(0, 0, 0, 0)), "$lt": new Date(new Date().setHours(23, 59, 59, 999)) };
			aggPipe.push({ "$match": match });

			let sort = {};
			(params.sortBy && params.sortOrder) ? sort = { [params.sortBy]: params.sortOrder } : sort = { created: -1 };
			aggPipe.push({ "$sort": sort });

			const options = { collation: true };

			aggPipe.push({
				"$project": {
					_id: 1, userType: 1, name: 1, email: 1, profilePicture: 1, onboardingProgress: 1, isApproved: 1, status: 1,
					created: 1, ndisNumber: 1
				}
			});

			let pageCount = true;
			if (params.latestUsers) pageCount = false;

			return await this.paginate("users", aggPipe, params.limit, params.pageNo, options, pageCount);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function blockUnblock
	 */
	async blockUnblock(params: BlockRequest) {
		try {
			const query: any = {};
			query._id = params.userId;

			const update = {};
			update["$set"] = {
				status: params.status,
				updateType: UPDATE_TYPE.BLOCK_UNBLOCK
			};
			const options = { new: true };

			return await this.findOneAndUpdate("users", query, update, options);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function verifyUser
	 */
	async verifyUser(params: UserRequest.VerifyUser) {
		try {
			const query: any = {};
			query._id = params.userId;

			const update = {};
			update["$set"] = params;
			const options = { new: true };

			return await this.findOneAndUpdate("users", query, update, options);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function editProfile
	 */
	async editProfile(params, userId: string, profileSteps?: string[]) {
		try {
			const query: any = {};
			query._id = userId;

			const update = {};
			if (Object.values(params).length) update["$set"] = params;
			if (!params.updateType) update["$unset"] = { updateType: "" };
			if (profileSteps && profileSteps.length) {
				update["$addToSet"] = { profileSteps: { "$each": profileSteps } };
				update["$pullAll"] = { skipSteps: profileSteps };
			}
			const options = { new: true };

			return await this.findOneAndUpdate("users", query, update, options);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function favouriteList
	 */
	async favouriteList(params: UserRequest.UserList) {
		try {
			const aggPipe = [];

			const query: any = {};
			query._id = { "$in": params.users };
			if (params.searchKey) {
				params.searchKey = escapeSpecialCharacter(params.searchKey);
				query["$or"] = [
					{ name: { "$regex": params.searchKey, "$options": "-i" } },
					{ email: { "$regex": params.searchKey, "$options": "-i" } }
				];
			}
			if (params.gender) query.gender = params.gender;
			if (params.categoryIds) query["categories._id"] = { "$in": params.categoryIds };
			if (params.interestIds) query["interests._id"] = { "$in": params.interestIds };
			query.status = { "$ne": STATUS.DELETED };

			aggPipe.push({
				"$geoNear": {
					"near": {
						"type": "Point",
						"coordinates": [params.lng, params.lat]
					},
					"spherical": true,
					"distanceField": "distance",
					"includeLocs": "locs",
					"query": query,
					"distanceMultiplier": DISTANCE_MULTIPLIER.METER_TO_KM
				}
			});

			aggPipe.push({ "$sort": { distance: 1 } });

			aggPipe.push({
				"$project": {
					_id: 1, name: 1, profilePicture: 1, userType: 1, categories: 1, rating: "$averageRating.value",
					distance: { "$round": ["$distance", -1] }, isFavourite: { "$literal": true }
				}
			});

			const options = { collation: true };

			return await this.aggregate("users", aggPipe, options);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function participantSupporterList
	 */
	async participantSupporterList(params: UserRequest.UserList) {
		try {
			const aggPipe = [];

			const query: any = {};
			query.userType = params.userType;
			query._id = { "$nin": params.users };
			query.isProfileHidden = false;
			if (params.searchKey) {
				params.searchKey = escapeSpecialCharacter(params.searchKey);
				query["$or"] = [
					{ name: { "$regex": params.searchKey, "$options": "-i" } },
					{ email: { "$regex": params.searchKey, "$options": "-i" } }
				];
			}
			if (params.gender) query.gender = params.gender;
			if (params.categoryIds) query["categories._id"] = { "$in": params.categoryIds };
			if (params.interestIds) query["interests._id"] = { "$in": params.interestIds };
			query.status = { "$ne": STATUS.DELETED };

			if (params.searchKey) {
				aggPipe.push({
					"$geoNear": {
						"near": {
							"type": "Point",
							"coordinates": [params.lng, params.lat]
						},
						"spherical": true,
						"distanceField": "distance",
						"includeLocs": "locs",
						"query": query,
						"distanceMultiplier": DISTANCE_MULTIPLIER.METER_TO_KM
					}
				});
			} else {
				aggPipe.push({
					"$geoNear": {
						"near": {
							"type": "Point",
							"coordinates": [params.lng, params.lat]
						},
						"spherical": true,
						"distanceField": "distance",
						"includeLocs": "locs",
						"query": query,
						"maxDistance": 50000,
						"distanceMultiplier": DISTANCE_MULTIPLIER.METER_TO_KM
					}
				});
			}

			aggPipe.push({ "$sort": { distance: 1, _id: -1 } });

			aggPipe.push({
				"$project": {
					_id: 1, name: 1, profilePicture: 1, categories: 1, rating: "$averageRating.value",
					distance: { "$round": ["$distance", -1] }, isFavourite: { "$literal": false }
				}
			});

			const options = { collation: true };

			return await this.paginate("users", aggPipe, params.limit, params.pageNo, options, false);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function friendList
	 */
	async friendList(params: UserRequest.UserList) {
		try {
			const aggPipe = [];

			const query: any = {};
			query._id = { "$in": params.users };
			if (params.searchKey) {
				params.searchKey = escapeSpecialCharacter(params.searchKey);
				query["$or"] = [
					{ name: { "$regex": params.searchKey, "$options": "-i" } },
					{ email: { "$regex": params.searchKey, "$options": "-i" } }
				];
			}
			if (params.gender) query.gender = params.gender;
			if (params.categoryIds) query["categories._id"] = { "$in": params.categoryIds };
			if (params.interestIds) query["interests._id"] = { "$in": params.interestIds };
			query.status = { "$ne": STATUS.DELETED };

			aggPipe.push({
				"$geoNear": {
					"near": {
						"type": "Point",
						"coordinates": [params.lng, params.lat]
					},
					"spherical": true,
					"distanceField": "distance",
					"includeLocs": "locs",
					"query": query,
					"distanceMultiplier": DISTANCE_MULTIPLIER.METER_TO_KM
				}
			});

			aggPipe.push({ "$sort": { distance: 1 } });

			aggPipe.push({
				"$project": {
					_id: 1, name: 1, profilePicture: 1, categories: 1, rating: "$averageRating.value",
					distance: { "$round": ["$distance", -1] }, isFavourite: { "$literal": true }
				}
			});

			const options = { collation: true };

			return await this.paginate("users", aggPipe, params.limit, params.pageNo, options, false);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function chatFriendList
	 */
	async chatFriendList(params) {
		try {
			const aggPipe = [];
			console.log(params.users, 'lllllllllllllllllllllllllllllllll')
			const query: any = {};
			query._id = { "$in": params.users };

			query.name = { $exists: true, $ne: null }
			if (params.searchKey) {
				params.searchKey = escapeSpecialCharacter(params.searchKey);
				query["$or"] = [
					{ name: { "$regex": params.searchKey, "$options": "-i" } },
					{ email: { "$regex": params.searchKey, "$options": "-i" } }
				];
			}


			aggPipe.push({ "$match": query })
			aggPipe.push({ "$sort": { createdAt: -1 } });

			aggPipe.push({
				"$project": {
					_id: 1, name: 1, profilePicture: 1, userType: 1, categories: 1, rating: "$averageRating.value",
					//distance: { "$round": ["$distance", -1] }, isFavourite: { "$literal": true }
				}
			});

			const options = { collation: true };

			return await this.aggregate("users", aggPipe)
			//return await this.paginate("users", aggPipe, params.limit, params.pageNo, options, false);
		} catch (error) {
			throw error;
		}
	}


	/**
	 * @function chatParticipantSupportList
	 */
	async chatParticipantSupportList(params, userType) {
		try {
			const aggPipe = [];

			const query: any = {};
			query.userType = userType;
			query.status = { "$ne": STATUS.DELETED }
			query.name = { $exists: true, $ne: null }
			if (params.searchKey) {
				params.searchKey = escapeSpecialCharacter(params.searchKey);
				query["$or"] = [
					{ name: { "$regex": params.searchKey, "$options": "-i" } },
					{ email: { "$regex": params.searchKey, "$options": "-i" } }
				];
			}


			aggPipe.push({ "$match": query })
			aggPipe.push({ "$sort": { createdAt: -1 } });
			if (!params.searchKey) {
				aggPipe.push({ "$limit": 10 })
			}
			aggPipe.push({
				"$project": {
					_id: 1, name: 1, profilePicture: 1, categories: 1, userType: 1, rating: "$averageRating.value",
					//distance: { "$round": ["$distance", -1] }, isFavourite: { "$literal": true }
				}
			});

			const options = { collation: true };

			return await this.aggregate("users", aggPipe)
			//return await this.paginate("users", aggPipe, params.limit, params.pageNo, options, false);
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function friendRequestList
	 */
	async friendRequestList(params: UserRequest.FriendRequestList, tokenData) {
		try {
			const aggPipe = [];

			const query: any = {};
			query["friendId._id"] = toObjectId(tokenData.userId)
			query.status = FRIEND_REQUEST_STATUS.REQUEST_SENT
			aggPipe.push({ "$match": query })
			aggPipe.push({ "$sort": { createdAt: -1 } });
			aggPipe.push({

				"$lookup": {
					"from": "users",
					"let": { "userId": "$userId" },
					"pipeline": [
						{ "$match": { "$expr": { "$eq": ["$_id", "$$userId"] } } },
						{ "$project": { "firstName": 1, "lastName": 1, "profilePicture": 1, "userType": 1 } }
					],
					"as": "user_detail"
				}

				//"$project": { firstName: 1, lastName: 1, profilePicture: 1 }
			});
			aggPipe.push({ "$unwind": "$user_detail" })
			aggPipe.push({
				"$project": {
					_id: 1, "friendId._id": 1, userId: 1, status: 1, createdAt: 1, user_detail: 1
				}
			});

			const options = { collation: true };

			let response = await this.paginate("friends", aggPipe, params.limit, params.pageNo, options, false);
			let counData = await this.aggregate("friends", aggPipe, {});

			response.total = counData.length;


			return response;

		} catch (error) {
			throw error;
		}
	}



	/**
	 * @function notificationList
	 */
	async notificationList(params: UserRequest.NotificationList, tokenData) {
		try {
			const aggPipe = [];

			const match: any = {};
			match.status = { "$ne": STATUS.DELETED };
			match.receiverId = toObjectId(tokenData.userId);
			aggPipe.push({

				"$lookup": {
					"from": "users",
					"let": { "senderId": "$senderId" },
					"pipeline": [
						{ "$match": { "$expr": { "$eq": ["$_id", "$$senderId"] } } },
						{ "$project": { "firstName": 1, "lastName": 1, "profilePicture": 1, "userType": 1 } }
					],
					"as": "user_detail"
				}

				//"$project": { firstName: 1, lastName: 1, profilePicture: 1 }
			});
			aggPipe.push({

				"$lookup": {
					"from": "friends",
					"let": { "requestId": "$requestId" },
					"pipeline": [
						{ "$match": { "$expr": { "$eq": ["$_id", "$$requestId"] } } },
						{ "$project": { "status": 1 } }
					],
					"as": "friendStatus"
				}

				//"$project": { firstName: 1, lastName: 1, profilePicture: 1 }
			});
			aggPipe.push(
				{ "$unwind": { path: '$friendStatus', preserveNullAndEmptyArrays: true } },
			)

			aggPipe.push({ "$match": match });
			aggPipe.push({ "$sort": { createdAt: -1 } });

			const options = { collation: true };

			let response = await this.paginate("notifications", aggPipe, params.limit, params.pageNo, options, false);
			let counData = await this.aggregate("notifications", aggPipe, {});

			response.total = counData.length;
			return response;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function notificationList
	 */
	async adminNotificationList(params: UserRequest.NotificationList, tokenData) {
		try {
			const aggPipe = [];

			const match: any = {};
			match.status = { "$ne": STATUS.DELETED };
			match.receiverId = toObjectId(tokenData.userId);
			aggPipe.push({

				"$lookup": {
					"from": "users",
					"let": { "senderId": "$senderId" },
					"pipeline": [
						{ "$match": { "$expr": { "$eq": ["$_id", "$$senderId"] } } },
						{ "$project": { "firstName": 1, "lastName": 1, "profilePicture": 1, "userType": 1 } }
					],
					"as": "user_detail"
				}

				//"$project": { firstName: 1, lastName: 1, profilePicture: 1 }
			});
			aggPipe.push({

				"$lookup": {
					"from": "activities",
					"let": { "activityId": "$activityId" },
					"pipeline": [
						{ "$match": { "$expr": { "$eq": ["$_id", "$$activityId"] } } },
						{ "$project": { "details": 1, "activityType": 1, "startTime": 1, "photo": 1 } }
					],
					"as": "activity_detail"
				}

				//"$project": { firstName: 1, lastName: 1, profilePicture: 1 }
			});
			aggPipe.push(
				{ "$unwind": { path: '$friendStatus', preserveNullAndEmptyArrays: true } },
			)

			aggPipe.push({ "$match": match });
			aggPipe.push({ "$sort": { createdAt: -1 } });

			const options = { collation: true };

			let response = await this.paginate("notifications", aggPipe, params.limit, params.pageNo, options, false);
			let counData = await this.aggregate("notifications", aggPipe, {});

			response.total = counData.length;
			return response;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function userGraph
	 * @author Rajat Maheshwari
	 */
	async userGraph(params: UserRequest.UserGraph) {
		try {
			let aggPipe = [];

			const match: any = {};
			match.userType = params.userType;
			match.status = { "$ne": STATUS.DELETED };
			aggPipe.push({ "$match": match });

			aggPipe.push({
				"$project": {
					year: { "$year": "$createdAt" }, month: { "$month": "$createdAt" },
					day: { "$dayOfMonth": "$createdAt" },
					week: { "$add": [1, { "$floor": { "$divide": [{ "$dayOfMonth": "$createdAt" }, 7] } }] } // week starts from monday
				}
			});

			switch (params.type) {
				case GRAPH_TYPE.MONTHLY: {
					aggPipe.push({ "$match": { year: params.year } });

					aggPipe.push({
						"$group": {
							_id: { year: "$year", month: "$month" },
							count: { "$push": { month: "$month" } }
						}
					});

					aggPipe.push({ "$group": { _id: "$_id.year", data: { "$push": { month: "$_id.month", count: { "$size": "$count" } } } } });

					aggPipe.push({ "$unwind": "$data" });

					aggPipe.push({ "$replaceRoot": { newRoot: "$data" } });
					break;
				}
			}

			return await this.aggregate("users", aggPipe, {});
		} catch (error) {
			throw error;
		}
	}


	async usreRatinData(params, tokenData) {
		try {
			const aggPipe = [];

			const match: any = {};

			match.participantId = toObjectId(params.userId);
			match.activityId = toObjectId(params.activityId)
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

				//"$project": { firstName: 1, lastName: 1, profilePicture: 1 }
			});



			aggPipe.push({ "$match": match });
			aggPipe.push({ "$sort": { createdAt: 1 } });
			aggPipe.push({
				"$project": { _id: 1, rate: 1, review: 1, participant_detail: 1 }
			})

			const options = { collation: true };

			//let response = await this.paginate("ratings", aggPipe, params.limit, params.pageNo, options, false);
			let counData = await this.aggregate("ratings", aggPipe, {});

			//response.total = counData.length;
			return counData;
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function supportChatList
	 */
	async supportChatList(params: UserRequest.SupportCHatList, tokenData) {
		try {
			const aggPipe = [];

			const match: any = {};
			//match.status = { "$ne": STATUS.DELETED };
			//match['receiverId._id'] = toObjectId(tokenData.userId);
			if (params.userId) {
				tokenData.userId = params.userId;
			}
			match["$or"] = [
				{ "receiverId._id": toObjectId(tokenData.userId) },
				{ "senderId._id": toObjectId(tokenData.userId) },
			];
			aggPipe.push({ "$match": match });
			aggPipe.push({ "$sort": { createdAt: 1 } });

			const options = { collation: true };

			let response = await this.paginate("supportchatmessages", aggPipe, params.limit, params.pageNo, options, false);
			let counData = await this.aggregate("supportchatmessages", aggPipe, {});

			response.total = counData.length;
			return response;
		} catch (error) {
			throw error;
		}
	}
	/**
	 * @function supportChatUserList
	 */
	async supportChatUserList(params: UserRequest.SupportCHatList, tokenData) {
		try {
			const aggPipe = [];

			const match: any = {};
			match.type = 1;
			//match['receiverId._id'] = toObjectId(tokenData.userId);

			match["$or"] = [
				{ "receiverId._id": toObjectId(tokenData.userId) },
				{ "senderId._id": toObjectId(tokenData.userId) },
			];
			if (params.searchKey) {
				params.searchKey = escapeSpecialCharacter(params.searchKey);
				match["$or"] = [
					{ "senderId.name": { "$regex": params.searchKey, "$options": "-i" } },
					// 	{ email: { "$regex": params.searchKey, "$options": "-i" } },
					// 	{ ndisNumber: { "$regex": params.searchKey, "$options": "-i" } }
				];
			}
			aggPipe.push({ "$match": match });
			aggPipe.push({ "$sort": { updatedAt: -1 } });
			aggPipe.push({

				"$lookup": {
					"from": "supportchatmessages",
					"let": { "userId": "$senderId._id" },
					"pipeline": [
						{
							"$match": {

								"$expr":
								{
									$and: [
										{
											"$eq": ["$senderId._id", "$$userId"]
										},
										{
											"$eq": ["$isRead", false]
										}
									]
								}

							}
						},
						{ "$project": { "senderId": 1 } }
					],
					"as": "user_detail"
				}

				//"$project": { firstName: 1, lastName: 1, profilePicture: 1 }
			});
			aggPipe.push({ "$project": { _id: 1, senderId: 1, "unReadCount": { $size: "$user_detail" } } })
			const options = { collation: true };

			let response = await this.paginate("supportchats", aggPipe, params.limit, params.pageNo, options, false);
			let counData = await this.aggregate("supportchats", aggPipe, {});

			response.total = counData.length;
			return response;
		} catch (error) {
			throw error;
		}
	}
}

export const userDao = new UserDao();