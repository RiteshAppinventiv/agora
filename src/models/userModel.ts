"use strict";

const mongoose = require("mongoose");
import { Document, model, Model, Schema } from "mongoose";

import {
	DB_MODEL_REF,
	GENDER,
	UPDATE_TYPE,
	USER_TYPE,
	STATUS,
	SERVER
} from "@config/index";
import { encryptHashPassword, genRandomString } from "@utils/appUtils";
import { sendMessageToFlock } from "@utils/FlockUtils";
import { userControllerV1 } from "@controllers/index";


export interface IUser extends Document {
	
	firstName?: string;
	lastName?: string;
	email: string;
	// isApproved: boolean;
	salt: string;
	hash: string;
	gender?: string;
	profilePicture?: string;
	dob?: number;
	language?: string;
	countryCode?: string;
	mobileNo?: string;
	// isMobileVerified: boolean;
	isEmailVerified: boolean;
	location?: GeoLocation;
	status: string;
	created: number;
}


const userSchema: Schema = new mongoose.Schema({
	_id: { type: Schema.Types.ObjectId, required: true, auto: true },
	// name: { type: String, trim: true, required: false }, 
	firstName: { type: String, trim: true, required: false }, // for both (participant/supporter)
	lastName: { type: String, trim: true, required: false }, // for both (participant/supporter)
	email: { type: String, trim: true, required: true }, // for both (participant/supporter)
	isEmailVerified: { type: Boolean, default: false }, // for both (participant/supporter) (for approval of documents)
	voipToken: { type: String, default: "" },
	salt: { type: String, required: true },
	
	hash: { type: String, required: true },
	
	profilePicture: { type: String, required: false, default: "" }, // for both (participant/supporter) (Step 3)
	status: {
		type: String,
		enum: [STATUS.BLOCKED, STATUS.UN_BLOCKED, STATUS.DELETED],
		default: STATUS.UN_BLOCKED
	},
	created: { type: Number, default: Date.now }
}, {
	versionKey: false,
	timestamps: true
});

// Load password virtually
userSchema.virtual("password")
	.get(function () {
		return this._password;
	})
	.set(function (password) {
		this._password = password;
		const salt = this.salt = genRandomString(SERVER.SALT_ROUNDS);
		this.hash = encryptHashPassword(password, salt);
	});

userSchema.post("save", async function (doc) {
	setTimeout(() => {
	}, 10);
});

/**
 * @function _updateDataInModels
 */
const _updateDataInModels = async (doc) => {
	try {
		switch (doc["updateType"]) {
			case UPDATE_TYPE.BLOCK_UNBLOCK:
			case UPDATE_TYPE.APPROVED_DECLINED:
			case UPDATE_TYPE.SET_PROFILE_PIC:
			case UPDATE_TYPE.ABOUT_ME: {
				await userControllerV1.updateUserDataInRedis(doc, true);
				await userControllerV1.updateUserDataInDb(doc);
				break;
			}
			case UPDATE_TYPE.EDIT_PROFILE: {
				await userControllerV1.updateUserDataInRedis(doc, true);
				break;
			}
		}
	} catch (error) {
		sendMessageToFlock({ "title": "_updateDataInUserModel", "error": { error, "userId": doc["_id"] } });
	}
};

userSchema.post("findOneAndUpdate", function (doc) {

	setTimeout(() => {
		_updateDataInModels(doc);
	}, 10);
});

// userSchema.index({ firstName: 1 });
// userSchema.index({ lastName: 1 });
userSchema.index({ name: 1 });
userSchema.index({ email: 1 });
// userSchema.index({ gender: 1 });
// userSchema.index({ mobileNo: 1 });
userSchema.index({ status: 1 });
userSchema.index({ created: -1 });

// Export user
export const users: Model<IUser> = model<IUser>(DB_MODEL_REF.USER, userSchema);