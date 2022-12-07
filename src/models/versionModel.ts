// "use strict";

// const mongoose = require("mongoose");
// import { Document, model, Model, Schema } from "mongoose";

// import { DB_MODEL_REF, DEVICE_TYPE, STATUS, VERSION_UPDATE_TYPE } from "@config/constant";

// export interface IVersion extends Document {
// 	name: string;
// 	description?: string;
// 	platform: string;
// 	updateType: string;
// 	currentVersion?: string;
// 	status: string;
// 	created: number;
// }

// const versionSchema: Schema = new mongoose.Schema({
// 	name: { type: String, trim: true, index: true, required: true },
// 	description: { type: String, trim: true, required: false },
// 	platform: {
// 		type: String,
// 		required: true,
// 		enum: [DEVICE_TYPE.ANDROID, DEVICE_TYPE.IOS]
// 	},
// 	updateType: {
// 		type: String,
// 		required: true,
// 		enum: Object.values(VERSION_UPDATE_TYPE)
// 	},
// 	currentVersion: { type: String },
// 	status: {
// 		type: String,
// 		enum: [STATUS.UN_BLOCKED, STATUS.BLOCKED, STATUS.DELETED],
// 		default: STATUS.UN_BLOCKED
// 	},
// 	created: { type: Number, default: Date.now }
// }, {
// 	versionKey: false,
// 	timestamps: true
// });

// // Export version
// export const versions: Model<IVersion> = model<IVersion>(DB_MODEL_REF.VERSION, versionSchema);