// "use strict";


// import * as mongoose from "mongoose";
// import { Model } from "mongoose";
// import { MODULES, MODULES_ID, STATUS, DB_MODEL_REF } from "@config/index";
// let Schema = mongoose.Schema;

// export interface IRole extends mongoose.Document {
// 	role: string;
// 	permission: object;
// 	status: number;
// }

// let permission = new Schema({
// 	module: { type: String, required: true, enum: Object.values(MODULES) },
// 	moduleId: { type: String, required: true, enum: Object.values(MODULES_ID) },
// 	all: { type: Boolean, default: false },
// 	view: { type: Boolean, default: false },
// 	add: { type: Boolean, default: false },
// 	edit: { type: Boolean, default: false },
// 	delete: { type: Boolean, default: false },
// 	activeInactive: { type: Boolean, default: false },
// }, {
// 	_id: false
// });

// let roleSchema = new Schema({
// 	_id: { type: Schema.Types.ObjectId, required: true, auto: true },
// 	role: { type: String, required: true, index: true },
// 	permission: [permission],
// 	status: {
// 		type: Number,
// 		enum: [
// 			STATUS.BLOCKED,
// 			STATUS.UN_BLOCKED,
// 			STATUS.DELETED
// 		],
// 		default: STATUS.UN_BLOCKED
// 	},
// 	createdAt: { type: Number, default: Date.now },
// 	updatedAt: { type: Number, default: Date.now }
// }, {
// 	versionKey: false,
// 	timestamps: false,
// });

// // Export roles
// export let roles: Model<IRole> = mongoose.model<IRole>(DB_MODEL_REF.ROLE, roleSchema);