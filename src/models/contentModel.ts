// "use strict";

// const mongoose = require("mongoose");
// import { Document, model, Model, Schema } from "mongoose";

// import { CONTENT_TYPE, DB_MODEL_REF } from "@config/constant";

// export interface IContent extends Document {
// 	data: string;
// 	type: string;
// 	question: string;
// 	answer: string;
// 	created: number;
// 	position: number;
// }

// const contentSchema: Schema = new mongoose.Schema({
// 	data: { type: String, trim: true, required: false },
// 	type: {
// 		type: String,
// 		required: true,
// 		enum: Object.values(CONTENT_TYPE)
// 	},
// 	position: { type: Number, required: false }, // Position of FAQ
// 	question: { type: String, required: false },
// 	answer: { type: String, required: false },
// 	created: { type: Number, default: Date.now }
// }, {
// 	versionKey: false,
// 	timestamps: true
// });

// // Export content
// export const contents: Model<IContent> = model<IContent>(DB_MODEL_REF.CONTENT, contentSchema);