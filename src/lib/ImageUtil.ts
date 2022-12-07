"use strict";

import * as AWS from "aws-sdk";
import * as	fs from "fs";
import * as path from "path";

import * as appUtils from "@utils/appUtils";
import { fileUploadExts, SERVER } from "@config/index";
import { audio, image, video } from "@json/mime-type.json";

export class ImageUtil {

	constructor() {
		AWS.config.update({
			// region: bucketRegion,
			accessKeyId: SERVER.AWS_IAM_USER.ACCESS_KEY_ID,
			secretAccessKey: SERVER.AWS_IAM_USER.SECRET_ACCESS_KEY
		});
	}

	private filters(file) {
		const mimetypes = [
			video.filter(v => v.extension === ".mp4")[0].mimetype,
			video.filter(v => v.extension === ".flv")[0].mimetype,
			video.filter(v => v.extension === ".mov")[0].mimetype,
			video.filter(v => v.extension === ".avi")[0].mimetype,
			video.filter(v => v.extension === ".wmv")[0].mimetype,

			image.filter(v => v.extension === ".jpg")[0].mimetype,
			image.filter(v => v.extension === ".jpeg")[0].mimetype,
			image.filter(v => v.extension === ".png")[0].mimetype,
			image.filter(v => v.extension === ".jpg")[0].mimetype,
			image.filter(v => v.extension === ".svg")[0].mimetype,

			audio.filter(v => v.extension === ".mp3")[0].mimetype,
			audio.filter(v => v.extension === ".aac")[0].mimetype,
			audio.filter(v => v.extension === ".aiff")[0].mimetype,
			audio.filter(v => v.extension === ".m4a")[0].mimetype,
			audio.filter(v => v.extension === ".ogg")[0].mimetype,
		];

		if (
			fileUploadExts.indexOf(path.extname(file.hapi.filename.toLowerCase())) !== -1 &&
			mimetypes.indexOf(file.hapi.headers["content-type"]) !== -1
		) {
			return true;
		}
		return false;
	}

	/**
	 * @function uploadImage This Function is used to uploading image to S3 Server
	 */
	private _uploadToS3(fileName, fileBuffer, contentType) {
		try {
			return new Promise((resolve, reject) => {
				const s3 = new AWS.S3({ params: { Bucket: SERVER.S3.BUCKET_NAME } });
				s3.upload({
					Key: String(fileName),
					Body: fileBuffer,
					ContentType: contentType,
					Bucket: SERVER.S3.BUCKET_NAME,
					ACL: "public-read"
				}, (error, data) => {
					if (error) {
						console.log("Upload failed: ", error);
						reject(error);
					} else
						resolve(data);
				});
			});
		} catch (error) {
			throw error;
		}
	}

	/**
	 * @function uploadSingleMediaToS3 This Function is used to upload single image to S3 Server
	 */
	uploadSingleMediaToS3(file) {
		console.log("content-type=========>", file.hapi.headers["content-type"]);
		console.log("extension============>", path.extname(file.hapi.filename.toLowerCase()));
		return new Promise((resolve, reject) => {
			if (this.filters(file)) {
				const fileName = appUtils.getDynamicName(file);
				// const fileName = file.hapi.filename.split(".png")[0];
				const filePath = `${SERVER.UPLOAD_DIR}${fileName}`;
				console.log("filePath==========>", filePath);

				const r = file.pipe(fs.createWriteStream(filePath));
				r.on("close", () => {
					fs.readFile(filePath, (error, fileBuffer) => {
						if (error) reject(error);
						this._uploadToS3(fileName, fileBuffer, file.hapi.headers["content-type"])
							.then((data: any) => {
								appUtils.deleteFiles(filePath);
								const location = data.Location;
								resolve(location);
							})
							.catch((error) => {
								reject(error);
							});
					});
				});
			} else {
				reject(new Error("Invalid file type!"));
			}
		});
	}

	deleteFromS3(filename) {
		filename = filename.split("/").slice(-1)[0];
		const s3 = new AWS.S3({
			// apiVersion: "2006-03-01",
			params: { Bucket: SERVER.S3.BUCKET_NAME }
		});
		return new Promise(function (resolve, reject) {
			const params = {
				Bucket: SERVER.S3.BUCKET_NAME,
				Key: filename
			};

			s3.deleteObject(params, function (error, data) {
				console.log(error, data);
				if (error) {
					reject(error);
				} else {
					resolve(data);
				}
			});
		});
	}
}

export const imageUtil = new ImageUtil();