// "use strict";

// const mongoose = require("mongoose");
// import { Document, model, Model, Schema } from "mongoose";

// import { DB_MODEL_REF, STATUS, CATEGORIES_STAUS } from "@config/constant";

// export interface Categories extends Document {
//     name: string;
//     lowercaseName: string;
//     type: string;
//     status: string;
//     created: number;
// }

// const categoriesSchema: Schema = new mongoose.Schema({
//     _id: { type: Schema.Types.ObjectId, required: true, auto: true },
//     name: { type: String, required: true },
//     lowercaseName: { type: String, required: true, lowercase: true },
//     type: {
//         type: String,
//         default: CATEGORIES_STAUS.ADMIN
//     },
//     status: {
//         type: String,
//         enum: [STATUS.BLOCKED, STATUS.UN_BLOCKED],
//         default: STATUS.UN_BLOCKED
//     },
//     created: { type: Number, default: Date.now }
// }, {
//     versionKey: false,
//     timestamps: true
// });

// categoriesSchema.index({ name: 1 });
// categoriesSchema.index({ status: 1 });
// categoriesSchema.index({ created: -1 });

// // Export categories
// export const categories: Model<Categories> = model<Categories>(DB_MODEL_REF.CATEGORIES, categoriesSchema);