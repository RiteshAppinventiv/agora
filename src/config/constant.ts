"use strict";

import {
	FIELD_REQUIRED as EN_FIELD_REQUIRED,
	SERVER_IS_IN_MAINTENANCE as EN_SERVER_IS_IN_MAINTENANCE,
	LINK_EXPIRED as EN_LINK_EXPIRED
} from "../../locales/en.json";

const SWAGGER_DEFAULT_RESPONSE_MESSAGES = [
	{ code: 200, message: "OK" },
	{ code: 400, message: "Bad Request" },
	{ code: 401, message: "Unauthorized" },
	{ code: 404, message: "Data Not Found" },
	{ code: 500, message: "Internal Server Error" }
];

const NOTIFICATION_DATA = {
	ADD_EDIT_EVENT: (userName, eventId, senderId, categoryName) => {
		return {
			"type": NOTIFICATION_TYPE.SHIFT_CREATE,
			"activityId": eventId,
			"senderId": senderId,
			"message": NOTIFICATION_MSG.CREATED_SHIFT,
			"body": NOTIFICATION_MSG.CREATED_SHIFT,
			"category": categoryName ? categoryName : "",
			"title": NOTIFICATION_TITLE.CREATE_SHIFT
		};
	},



}
const HTTP_STATUS_CODE = {
	OK: 200,
	CREATED: 201,
	UPDATED: 202,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	PAYMENY_REQUIRED: 402,
	ACCESS_FORBIDDEN: 403,
	FAV_USER_NOT_FOUND: 403,
	URL_NOT_FOUND: 404,
	METHOD_NOT_ALLOWED: 405,
	UNREGISTERED: 410,
	PAYLOAD_TOO_LARGE: 413,
	CONCURRENT_LIMITED_EXCEEDED: 429,
	// TOO_MANY_REQUESTS: 429,
	INTERNAL_SERVER_ERROR: 500,
	BAD_GATEWAY: 502,
	SHUTDOWN: 503,
	EMAIL_NOT_VERIFIED: 430,
	MOBILE_NOT_VERIFIED: 431,
	FRIEND_REQUEST_ERR: 432

};

const USER_TYPE = {
	ADMIN: "ADMIN",
	SUB_ADMIN: "SUB_ADMIN",
	USER: "USER",
	SUPPORTER: "SUPPORTER",
	PARTICIPANT: "PARTICIPANT"

};

const DB_MODEL_REF = {

	ADMIN: "admins",
	CATEGORIES: "categories",
	CONTENT: "contents",
	LOGIN_HISTORY: "login_histories",
	NOTIFICATION: "notifications",
	VERSION: "versions",
	USER: "users",
	ROLE: "roles"

};

const MODULES = {
	BANNER_MANAGEMENT: "Banner Management",
	NOTIFICATION_MANAGEMENT: "Notification Management",
	CONTENT_MANAGEMENT: "Content Management"
};

const MODULES_ID = {
	BANNER_MANAGEMENT: "1",
	NOTIFICATION_MANAGEMENT: "2",
	CONTENT_MANAGEMENT: "3"
}

const DEVICE_TYPE = {
	ANDROID: "1",
	IOS: "2",
	WEB: "3",
	ALL: "4"
};

const GENDER = {
	MALE: "MALE",
	FEMALE: "FEMALE",
	OTHER: "OTHER"
};

const CATEGORIES_STAUS = {
	ADMIN: "ADMIN",
	USER: "USER"
};

const STATUS = {
	BLOCKED: "BLOCKED",
	UN_BLOCKED: "UN_BLOCKED",
	ACTIVE: "ACTIVE",
	DELETED: "DELETED",
	UPCOMING: "UPCOMING",
	ONGOING: "ONGOING",
	ENDED: "ENDED",
	EXPIRED: "EXPIRED",
	INCOMPLETE: "INCOMPLETE",
	ACCEPTED: "ACCEPTED",
	CONFIRMED: {
		NUMBER: 1,
		TYPE: "CONFIRMED",
		DISPLAY_NAME: "Confirmed"
	},
	COMPLETED: {
		NUMBER: 2,
		TYPE: "COMPLETED",
		DISPLAY_NAME: "Completed"
	},
	CANCELLED: {
		NUMBER: 3,
		TYPE: "CANCELLED",
		DISPLAY_NAME: "Cancelled"
	},
	PENDING: {
		NUMBER: 4,
		TYPE: "PENDING",
		DISPLAY_NAME: "Pending"
	},
	NOT_ATTENTED: {
		NUMBER: 5,
		TYPE: "NOT_ATTENTED",
		DISPLAY_NAME: "Not Attended"
	},
	OLD_COMPLETED: {
		NUMBER: 6,
		TYPE: "OLD_COMPLETE",
		DISPLAY_NAME: "Old complete"
	}
};
const STAR_DATA = [

	{
		"TEXT": "Terrible",
		"VALUE": 1
	},
	{
		"TEXT": "Awkward",
		"VALUE": 2
	},
	{
		"TEXT": "Ok Ok",
		"VALUE": 3
	},
	{
		"TEXT": "Good",
		"VALUE": 4
	},
	{
		"TEXT": "Excellent",
		"VALUE": 5
	},
]
// - 1 Star: Terrible
// - 2 Star: Awkward
// - 3 Star: Ok Ok
// - 4 Star: Good
// - 5 Star: Excellent


const VALIDATION_CRITERIA = {
	FIRST_NAME_MIN_LENGTH: 3,
	FIRST_NAME_MAX_LENGTH: 10,
	MIDDLE_NAME_MIN_LENGTH: 3,
	MIDDLE_NAME_MAX_LENGTH: 10,
	LAST_NAME_MIN_LENGTH: 3,
	LAST_NAME_MAX_LENGTH: 10,
	NAME_MIN_LENGTH: 3,
	COUNTRY_CODE_MIN_LENGTH: 1,
	COUNTRY_CODE_MAX_LENGTH: 4,
	PASSWORD_MIN_LENGTH: 8,
	PASSWORD_MAX_LENGTH: 40,
	LATITUDE_MIN_VALUE: -90,
	LATITUDE_MAX_VALUE: 90,
	LONGITUDE_MIN_VALUE: -180,
	LONGITUDE_MAX_VALUE: 180
};

const NOTIFICATION_MSG = {
	CREATED_SHIFT: 'New shift activity created for you',


}
const NOTIFICATION_TITLE = {
	CREATE_SHIFT: 'Create Shift Activity',

}



const VALIDATION_MESSAGE = {
	invalidId: {
		pattern: "Invalid Id."
	},
	mobileNo: {
		pattern: "Please enter a valid mobile number."
	},
	email: {
		pattern: "Please enter email address in a valid format."
	},
	password: {
		required: "Please enter password.",
		pattern: "Please enter a valid password.",
		// pattern: `Please enter a proper password with minimum ${VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH} character, which can be alphanumeric with special character allowed.`,
		minlength: `Password must be between ${VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH}-${VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH} characters.`,
		// maxlength: `Please enter a proper password with minimum ${VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH} character, which can be alphanumeric with special character allowed.`
		maxlength: `Password must be between ${VALIDATION_CRITERIA.PASSWORD_MIN_LENGTH}-${VALIDATION_CRITERIA.PASSWORD_MAX_LENGTH} characters.`
	}
};

const MESSAGES = {
	ERROR: {
		UNAUTHORIZED_ACCESS: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "UNAUTHORIZED_ACCESS"
		},
		INTERNAL_SERVER_ERROR: {
			"statusCode": HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
			"type": "INTERNAL_SERVER_ERROR"
		},
		BAD_TOKEN: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "BAD_TOKEN"
		},
		TOKEN_EXPIRED: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "TOKEN_EXPIRED"
		},
		TOKEN_GENERATE_ERROR: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "TOKEN_GENERATE_ERROR"
		},
		BLOCKED: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "BLOCKED"
		},
		INCORRECT_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.ACCESS_FORBIDDEN,
			"type": "INCORRECT_PASSWORD"
		},
		BLOCKED_MOBILE: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "BLOCKED_MOBILE"
		},
		SESSION_EXPIRED: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,
			"type": "SESSION_EXPIRED"
		},
		FAV_USER_NOT_FOUND: {
			"statusCode": HTTP_STATUS_CODE.FAV_USER_NOT_FOUND,
			"type": "FAV_NOT_FOUND"
		},
		ERROR: (value, code = HTTP_STATUS_CODE.BAD_REQUEST) => {
			return {
				"statusCode": code,
				"message": value,
				"type": "ERROR"
			};
		},
		FRIEND_ERROR: (value, code = HTTP_STATUS_CODE.FRIEND_REQUEST_ERR) => {
			return {
				"statusCode": code,
				"message": value,
				"type": "ERROR"
			};
		},
		FIELD_REQUIRED: (value, lang = "en") => {
			return {
				"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
				"message": lang === "en" ? EN_FIELD_REQUIRED.replace(/{value}/g, value) : EN_FIELD_REQUIRED.replace(/{value}/g, value),
				"type": "FIELD_REQUIRED"
			};
		},
		SOMETHING_WENT_WRONG: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "SOMETHING_WENT_WRONG"
		},
		SERVER_IS_IN_MAINTENANCE: (lang = "en") => {
			return {
				"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
				"message": lang === "en" ? EN_SERVER_IS_IN_MAINTENANCE : EN_SERVER_IS_IN_MAINTENANCE,
				"type": "SERVER_IS_IN_MAINTENANCE"
			};
		},
		LINK_EXPIRED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"message": EN_LINK_EXPIRED,
			"type": "LINK_EXPIRED"
		},
		EMAIL_NOT_REGISTERED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "EMAIL_NOT_REGISTERED"
		},
		EMAIL_ALREADY_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "EMAIL_ALREADY_EXIST"
		},
		EMAIL_NOT_VERIFIED: (code = HTTP_STATUS_CODE.BAD_REQUEST) => {
			return {
				"statusCode": code,
				"type": "EMAIL_NOT_VERIFIED"
			}
		},
		INVALID_OLD_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INVALID_OLD_PASSWORD"
		},
		NEW_CONFIRM_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "NEW_CONFIRM_PASSWORD"
		},
		OTP_EXPIRED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "OTP_EXPIRED"
		},
		INVALID_OTP: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INVALID_OTP"
		},
		// user specific
		USER_NOT_FOUND: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "USER_NOT_FOUND"
		},
		PROFILE_NOT_COMPLETED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "PROFILE_NOT_COMPLETED"
		},
		DOCUMENT_NOT_APPROVED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "DOCUMENT_NOT_APPROVED"
		},
		MOBILE_NO_NOT_VERIFIED: {
			"statusCode": HTTP_STATUS_CODE.MOBILE_NOT_VERIFIED,
			"type": "MOBILE_NO_NOT_VERIFIED"
		},
		MOBILE_NO_ALREADY_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "MOBILE_NO_ALREADY_EXIST"
		},
		// content specific
		CONTENT_ALREADY_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "CONTENT_ALREADY_EXIST"
		},
		CONTENT_NOT_FOUND: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "CONTENT_NOT_FOUND"
		},
		FAQ_ALREADY_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "FAQ_ALREADY_EXIST"
		},
		// interest specific
		INTEREST_ALREADY_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "INTEREST_ALREADY_EXIST"
		},
		INTEREST_NOT_FOUND: {
			statusCode: HTTP_STATUS_CODE.URL_NOT_FOUND,
			type: "INTEREST_NOT_FOUND"
		},
		CANT_BLOCK_INTEREST: {
			statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
			type: "CANT_BLOCK_INTEREST"
		},
		// categories specific
		CATEGORY_ALREADY_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "CATEGORY_ALREADY_EXIST"
		},
		CATEGORY_NOT_FOUND: {
			statusCode: HTTP_STATUS_CODE.URL_NOT_FOUND,
			type: "CATEGORY_NOT_FOUND"
		},
		CANT_BLOCK_CATEGORY: {
			statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
			type: "CANT_BLOCK_CATEGORY"
		},
		// version Specific
		VERSION_ALREADY_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,
			"type": "VERSION_ALREADY_EXIST"
		},

		INVALID_ADMIN: {
			"statusCode": HTTP_STATUS_CODE.UNAUTHORIZED,

			"type": "INVALID_ADMIN"
		},
		ROLE_ALREADY_EXIST: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,

			"type": "ROLE_ALREADY_EXIST"
		},
		INVALID_ROLE_ID: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,

			"type": "INVALID_ROLE_ID"
		},

		INVALID_SUB_ADMIN: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,

			"type": "INVALID_SUB_ADMIN"
		},
		ROLE_IS_BLOCKED: {
			"statusCode": HTTP_STATUS_CODE.BAD_REQUEST,

			"type": "ROLE_IS_BLOCKED"
		}
	},
	SUCCESS: {
		DEFAULT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "DEFAULT"
		},
		DETAILS: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "DEFAULT",
				"data": data
			};
		},
		LIST: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "DEFAULT",
				...data
			};
		},
		SEND_OTP: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "SEND_OTP"
		},
		MAIL_SENT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "MAIL_SENT"
		},
		VERIFY_OTP: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "VERIFY_OTP",
				"data": data
			};
		},
		RESET_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "RESET_PASSWORD"
		},
		MAKE_PUBLIC_SHIFT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "MAKE_PUBLIC_SHIFT"
		},
		CHANGE_PASSWORD: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "CHANGE_PASSWORD"
		},
		EDIT_PROFILE: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "EDIT_PROFILE"
		},
		// admin specific
		ADMIN_LOGIN: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "ADMIN_LOGIN",
				"data": data
			};
		},
		LOGOUT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "LOGOUT"
		},
		// notification specific
		NOTIFICATION_DELETED: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "NOTIFICATION_DELETED"
		},
		// content specific
		ADD_CONTENT: {
			"statusCode": HTTP_STATUS_CODE.CREATED,
			"type": "ADD_CONTENT"
		},
		DELETE_FAQ: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "DELETE_FAQ"
		},
		EDIT_CONTENT: {
			"statusCode": HTTP_STATUS_CODE.UPDATED,
			"type": "EDIT_CONTENT"
		},
		// user specific
		SIGNUP: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "SIGNUP",
				"data": data
			};
		},
		LOGIN: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"type": "LOGIN",
				"data": data
			};
		},
		USER_LOGOUT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "USER_LOGOUT"
		},
		BLOCK_USER: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "BLOCK_USER"
		},
		UNBLOCK_USER: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "UNBLOCK_USER"
		},
		VERIFICATION_APPROVED: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "VERIFICATION_APPROVED"
		},
		VERIFICATION_REJECTED: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "VERIFICATION_REJECTED"
		},
		ADD_PHOTO: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "ADD_PHOTO"
		},
		SET_INTEREST: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "SET_INTEREST"
		},
		EDIT_DISABILITY_DETAILS: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "EDIT_DISABILITY_DETAILS"
		},
		EMAIL_UPLOAD: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "EMAIL_UPLOAD"
		},
		EDIT_PAYMENT_DETAILS: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "EDIT_PAYMENT_DETAILS"
		},
		EDIT_EMERGENCY_CONTACT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "EDIT_EMERGENCY_CONTACT"
		},
		EDIT_NDIS_PLAN: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "EDIT_NDIS_PLAN"
		},
		UPLOAD_SUPPORTING_DOCUMENT: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "UPLOAD_SUPPORTING_DOCUMENT"
		},
		UPLOAD_CERTIFICATIONS: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "UPLOAD_CERTIFICATIONS"
		},
		UPLOAD_NDIS_PLAN: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "UPLOAD_NDIS_PLAN"
		},
		UPLOAD_RESUME: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "UPLOAD_RESUME"
		},
		UPLOAD_INDUCTION_CERTIFICATES: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "UPLOAD_INDUCTION_CERTIFICATES"
		},
		UPLOAD_NDIS_TRAINING_CERTIFICATE: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "UPLOAD_NDIS_TRAINING_CERTIFICATE"
		},
		UPLOAD_CAR_INSURANCE: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "UPLOAD_CAR_INSURANCE"
		},
		LIKE_USER: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "LIKE_USER"
		},
		UNLIKE_USER: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "UNLIKE_USER"
		},
		PROFILE_SETTINGS: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "PROFILE_SETTINGS"
		},
		PROFILE_IMAGE: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "PROFILE_IMAGE"
		},
		RATE_SUPPORTER: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "RATE_SUPPORTER"
		},
		// version specific
		ADD_VERSION: {
			"statusCode": HTTP_STATUS_CODE.CREATED,
			"type": "ADD_VERSION"
		},
		DELETE_VERSION: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "DELETE_VERSION"
		},
		EDIT_VERSION: {
			"statusCode": HTTP_STATUS_CODE.UPDATED,
			"type": "EDIT_VERSION"
		},
		// interest specific
		ADD_INTEREST: {
			"statusCode": HTTP_STATUS_CODE.CREATED,
			"type": "ADD_INTEREST"
		},
		BLOCK_INTEREST: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "BLOCK_INTEREST"
		},
		UNBLOCK_INTEREST: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "UNBLOCK_INTEREST"
		},
		EDIT_INTEREST: {
			"statusCode": HTTP_STATUS_CODE.UPDATED,
			"type": "EDIT_INTEREST"
		},
		// category specific
		ADD_CATEGORY: {
			"statusCode": HTTP_STATUS_CODE.CREATED,
			"type": "ADD_CATEGORY"
		},
		BLOCK_CATEGORY: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "BLOCK_CATEGORY"
		},
		UNBLOCK_CATEGORY: {
			"statusCode": HTTP_STATUS_CODE.OK,
			"type": "UNBLOCK_CATEGORY"
		},
		EDIT_CATEGORY: {
			"statusCode": HTTP_STATUS_CODE.UPDATED,
			"type": "EDIT_CATEGORY"
		},
		ROLE_CREATED: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.CREATED,

				"type": "ROLE_CREATED",
				"data": data
			};
		},
		ROLE_EDITED: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.UPDATED,

				"type": "ROLE_EDITED",
				"data": data
			};
		},
		ROLE_BLOCKED: {
			"statusCode": HTTP_STATUS_CODE.UPDATED,

			"type": "ROLE_BLOCKED"
		},
		ROLE_UNBLOCKED: {
			"statusCode": HTTP_STATUS_CODE.UPDATED,

			"type": "ROLE_UNBLOCKED"
		},
		ROLE_DELETED: {
			"statusCode": HTTP_STATUS_CODE.UPDATED,

			"type": "ROLE_DELETED"
		},
		ROLE_LIST: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,

				"type": "ROLE_LIST",
				"data": data
			};
		},
		ROLE_DETAILS: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"message": "Role details get successfully",
				"type": "ROLE_DETAILS",
				"data": data
			};
		},
		SUB_ADMIN_CREATED: {
			"statusCode": HTTP_STATUS_CODE.CREATED,
			"message": "Sub admin registered successfully",
			"type": "SUB_ADMIN_CREATED",
		},
		SUB_ADMIN_EDITED: {
			"statusCode": HTTP_STATUS_CODE.UPDATED,
			"message": "Subadmin updated successfully",
			"type": "SUB_ADMIN_EDITED",
		},
		SUB_ADMIN_BLOCKED: {
			"statusCode": HTTP_STATUS_CODE.UPDATED,
			"message": "Subadmin inactivated successfully",
			"type": "SUB_ADMIN_BLOCKED"
		},
		SUB_ADMIN_UNBLOCKED: {
			"statusCode": HTTP_STATUS_CODE.UPDATED,
			"message": "Subadmin activated successfully",
			"type": "SUB_ADMIN_UNBLOCKED"
		},
		SUB_ADMIN_DELETED: {
			"statusCode": HTTP_STATUS_CODE.UPDATED,
			"message": "Subadmin deleted successfully",
			"type": "SUB_ADMIN_DELETED"
		},
		SUB_ADMIN_LIST: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"message": "Sub admin list get successfully",
				"type": "SUB_ADMIN_LIST",
				"data": data
			};
		},
		SUB_ADMIN_DETAILS: (data) => {
			return {
				"statusCode": HTTP_STATUS_CODE.OK,
				"message": "Sub admin details get successfully",
				"type": "SUB_ADMIN_DETAILS",
				"data": data
			};
		}
	}

};

const TEMPLATES = {
	EMAIL: {
		SUBJECT: {
			FORGOT_PASSWORD: "Reset Password Request",
			// RESET_PASSWORD: "Reset password link",
			// VERIFY_EMAIL: "Verify email address",
			WELCOME: "Welcome to Conkur!",
			ACCOUNT_BLOCKED: "Account Blocked",
			VERIFICATION_REJECTED: "Verification Process Rejected",
			UPLOAD_DOCUMENT: "Upload Document",
			INCIDENT_REPORT: "Incident Report",
			VERIFY_OTP: "Verify Otp",
			RESEND_OTP: "Resend Otp Request",
			RESEND_EMAIL: "Resend Email Request",
		},
		// BCC_MAIL: [""],
		FROM_MAIL: process.env["FROM_MAIL"]
	},
	SMS: {
		OTP: `Your Rcc Code is .`,
		THANKS: `Thanks, Rcc Team`
	}
};

const FIREBASE_TOKEN = {
	FIREBASE_ACCOUNT_KEY: "",//process.env["FIREBASE_ACCOUNT_KEY"],
	FIREBASE_DATABASE_URL: ""// process.env["DB_URL"]
}

const CONTENT_TYPE = {
	FAQ: "FAQ",
	PRIVACY_POLICY: "PRIVACY_POLICY",
	CONTACT_US: "CONTACT_US",
	ABOUT_US: "ABOUT_US",
	TERMS_AND_CONDITIONS: "TERMS_AND_CONDITIONS",
	TERMS_OF_SERVICE_AGREEMENT: "TERMS_OF_SERVICE_AGREEMENT",
	EMPLOYMENT_CONTRACT_AGREEMENT: "EMPLOYMENT_CONTRACT_AGREEMENT",
	CODE_OF_CONDUCT: "CODE_OF_CONDUCT",
	DWES_CHECK_SIGNED: "DWES_CHECK_SIGNED"
};

const MIME_TYPE = {
	XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	CSV1: "application/vnd.ms-excel",
	CSV2: "text/csv",
	CSV3: "data:text/csv;charset=utf-8,%EF%BB%BF",
	XLS: "application/vnd.ms-excel"
};

const REGEX = {
	// EMAIL: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/,
	EMAIL: /^\w+([.-]\w+)*@\w+([.-]\w+)*\.\w{2,5}$/i,
	// EMAIL: /^(([^<>()\[\]\\.,;:\s@']+(\.[^<>()\[\]\\.,;:\s@']+)*)|('.+'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	/* URL: /^(http?|ftp|https):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.(com|edu|gov|\
		int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(:[0-9]+)*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/, */
	URL: /^(https?|http|ftp|torrent|image|irc):\/\/(-\.)?([^\s\/?\.#-]+\.?)+(\/[^\s]*)?$/i,
	SSN: /^(?!219-09-9999|078-05-1120)(?!666|000|9\d{2})\d{3}-(?!00)\d{2}-(?!0{4})\d{4}$/, // US SSN
	ZIP_CODE: /^[0-9]{5}(?:-[0-9]{4})?$/,
	PASSWORD: /(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=.*[@#$%^&+=])(?=[^0-9]*[0-9]).{8,16}/, // Minimum 6 characters, At least 1 lowercase alphabetical character, At least 1 uppercase alphabetical character, At least 1 numeric character, At least one special character
	COUNTRY_CODE: /^\d{1,4}$/,
	MOBILE_NUMBER: /^\d{6,16}$/,
	STRING_REPLACE: /[-+ ()*_$#@!{}|\/^%`~=?,.<>:;'"]/g,
	SEARCH: /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g,
	MONGO_ID: /^[a-f\d]{24}$/i
};

const VERSION_UPDATE_TYPE = {
	NORMAL: "NORMAL", // skippable
	FORCEFULLY: "FORCEFULLY"
};

const NOTIFICATION_TYPE = {
	SHIFT_CREATE: "CREATE_SHIFT",

	EVENT: "1",

};

const GRAPH_TYPE = {
	DAILY: "DAILY",
	WEEKLY: "WEEKLY",
	MONTHLY: "MONTHLY",
	YEARLY: "YEARLY"
};

const MONTHS = [
	{ index: 1, day: 31, week: 5 },
	{ index: 2, day: 28, week: 4 },
	// { index: 2, day: 29, week: 5 },
	{ index: 3, day: 31, week: 5 },
	{ index: 4, day: 30, week: 5 },
	{ index: 5, day: 31, week: 5 },
	{ index: 6, day: 30, week: 5 },
	{ index: 7, day: 31, week: 5 },
	{ index: 8, day: 31, week: 5 },
	{ index: 9, day: 30, week: 5 },
	{ index: 10, day: 31, week: 5 },
	{ index: 11, day: 30, week: 5 },
	{ index: 12, day: 31, week: 5 }
];

const MONTH_NAME = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

const WEEK_NAME = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const JOB_SCHEDULER_TYPE = {
	ACTIVITY_BOOKING: "activity_booking",
	START_GROUP_ACTIVITY: "start_group_activity",
	FINISH_GROUP_ACTIVITY: "finish_group_activity",
	EXPIRE_GROUP_ACTIVITY: "expire_group_activity",
	EXPIRE_SHIFT_ACTIVITY: "expire_shift_activity",
	EXPIRE_SHIFT_START_TIME: "expire_shift_activity_start_time",
	SHIFT_NOTIFICATION_INTERVAL: "shift_notification_interval",
	GROUP_NOTIFICATION_INTERVAL: "group_notification_interval",
	EXPIRE_GROUP_START_TIME: "expire_group_activity_start_time",
	AUTO_SESSION_EXPIRE: "auto_session_expire"
};

const LANGUAGES = [{
	"code": "en",
	"id": 38,
	"isSelected": false,
	"name": "English"
}];

const TOKEN_TYPE = {
	USER_LOGIN: "USER_LOGIN", // login/signup
	ADMIN_LOGIN: "ADMIN_LOGIN",
	ADMIN_OTP_VERIFY: "ADMIN_OTP_VERIFY"
};

const timeZones = [
	"Asia/Kolkata"
];

const PARTICIPANT_PROFILE_STEPS = {
	ABOUT_ME: {
		type: "1", // About me
		mandatory: true
	},

};

const SUPPORTER_PROFILE_STEPS = {
	ABOUT_ME: {
		type: "1", // About me
		mandatory: true
	},
	MY_SKILLS: {
		type: "2", // Skill/work types
		mandatory: true
	},
	ADD_PHOTO: {
		type: "3", // Add your photo
		mandatory: false
	},
	CHOOSE_INTEREST: {
		type: "4", // choose your interests
		mandatory: true
	},
	PAYMENT_DETAILS: {
		type: "5", // Payment details
		mandatory: false
	},
	UPLOAD_SUPPORTING_DOCUMENT: {
		type: "6", // Upload supporting document
		mandatory: true,
		displayName: "Upload supporting document"
	},
	UPLOAD_CERTIFICATIONS: {
		type: "7", // Upload Certifications or education
		mandatory: true,
		displayName: "Upload Certifications or education"
	},
	UPLOAD_RESUME: {
		type: "8", // Upload resume
		mandatory: true,
		displayName: "Upload resume"
	},
	UPLOAD_POINTS_OF_ID: {
		type: "9", // Upload 100 points of ID
		mandatory: true
	},
	REFEREE_DETAILS: {
		type: "10", // Referee details
		mandatory: true
	},
	PRIVACY_AGREEMENT: {
		type: "11", // Privacy agreement
		mandatory: true
	},
	TERMS_OF_SERVICE_AGREEMENT: {
		type: "12", // Terms of use or service agreement
		mandatory: true
	},
	EMPLOYMENT_CONTRACT_AGREEMENT: {
		type: "13", // Employment contract agreement
		mandatory: true
	},
	CODE_OF_CONDUCT: {
		type: "14", // Code of conduct
		mandatory: true
	},
	ADD_SIGNATURE: {
		type: "15", // Add signature
		mandatory: true
	},
	INDUCTION_CERTIFICATES: {
		type: "16", // Upload induction certificates or competencies
		mandatory: false
	},
	NATIONAL_POLICE_CHECK: {
		type: "17", // National police check
		mandatory: false
	},
	NDIS_TRAINING_CERTIFICATE: {
		type: "18", // NDIS commission training certificate
		mandatory: false,
		displayName: "Upload NDIS commission training certificate"
	},
	DWES_CHECK_SIGNED: {
		type: "19", // DWES Check signed
		mandatory: false
	},
	CAR_INSURANCE: {
		type: "20", // Car insurance
		mandatory: false
	},
	CAR_INSPECTION_CHECKLIST: {
		type: "21", // Car inspection checklist
		mandatory: false
	}
};

const UPDATE_TYPE = {
	BLOCK_UNBLOCK: "BLOCK_UNBLOCK",
	APPROVED_DECLINED: "APPROVED_DECLINED",
	ABOUT_ME: "ABOUT_ME",
	EDIT_PROFILE: "EDIT_PROFILE",
	SET_PROFILE_PIC: "SET_PROFILE_PIC"
};

const IMAP_SORT = {
	MOST_FAVOURATES: "BLOCK_UNBLOCK",
	HIGHEST_RATED_SUPPLIER: "APPROVED_DECLINED",
	EXPERINCES_ONLY: "ABOUT_ME",

};

const ACTIVITY_TYPE = {
	GROUP: "GROUP",
	SHIFT: "SHIFT"
};

const QUEUE_NAME = {
	DELAY_NON_DELAY: "delay-non-delay",
	STEPS_POINTS_SUMMARY_EVERYDAY: "steps-points-summary-everyday",
	AUTO_COMPLETE_CLASS_BOOKING: "auto-complete-class-booking",
	AUTO_INCOMPLETE_CLASS_BOOKING: "auto-incomplete-class-booking",
	POINTS_DISTRIBUTION: "points-distribution",
	CORPORATE_POINTS_DISTRIBUTION: "corporate-points-distribution",
	PUSH_NOTIFIACTION_IOS: "-push-notification-ios-v9",
	PUSH_NOTIFIACTION_ANDROID: "-push-notification-android-v9",
	PUSH_NOTIFIACTION_WEB: "-push-notification-web-v9",
	DATABASE_INSERT: "-data-base-insertion-v9",
	COUPON_CODE_ASSIGNED: "coupon-code-assigned"
};


const GROUP_ACTIVITY_RATIO = {
	PARTICIPANT: 6,
	SUPPORTER: 1
};

const DISTANCE_MULTIPLIER = {
	MILE_MULTIPLIER: 0.0006213727366498,
	KM_TO_MILE: 0.621372737,
	MILE_TO_METER: 1609.34,
	METER_TO_MILE: 0.000621371,
	METER_TO_KM: 0.001
};

const fileUploadExts = [
	".mp4", ".flv", ".mov", ".avi", ".wmv",
	".jpg", ".jpeg", ".png", ".gif", ".svg",
	".mp3", ".aac", ".aiff", ".m4a", ".ogg"
];

const REVIEWS = ["Funny", "Polite", "Cooks very well", "Did even more than needed", "Friendly", "I will ask for help more"];

const FRIEND_REQUEST_STATUS = {
	REQUEST_SENT: "REQUEST_SENT",
	REQUEST_ACCEPTED: "REQUEST_ACCEPTED",
	REQUEST_DECLINED: "REQUEST_DECLINED",
	UN_FRIEND: "UN_FRIEND"
};

const MEDIA_TYPE = {
	IMAGE: "IMAGE",
	AUDIO: "AUDIO",
	TEXT: "TEXT"
};

export {
	SWAGGER_DEFAULT_RESPONSE_MESSAGES,
	HTTP_STATUS_CODE,
	USER_TYPE,
	DB_MODEL_REF,
	DEVICE_TYPE,
	GENDER,
	STATUS,
	VALIDATION_CRITERIA,
	VALIDATION_MESSAGE,
	MESSAGES,
	CONTENT_TYPE,
	MIME_TYPE,
	REGEX,
	VERSION_UPDATE_TYPE,
	NOTIFICATION_TYPE,
	TEMPLATES,
	GRAPH_TYPE,
	MONTHS,
	MONTH_NAME,
	WEEK_NAME,
	JOB_SCHEDULER_TYPE,
	LANGUAGES,
	TOKEN_TYPE,
	timeZones,
	PARTICIPANT_PROFILE_STEPS,
	SUPPORTER_PROFILE_STEPS,
	UPDATE_TYPE,
	ACTIVITY_TYPE,


	DISTANCE_MULTIPLIER,
	GROUP_ACTIVITY_RATIO,
	NOTIFICATION_MSG,
	fileUploadExts,
	QUEUE_NAME,
	NOTIFICATION_DATA,
	REVIEWS,
	CATEGORIES_STAUS,
	FRIEND_REQUEST_STATUS,
	MEDIA_TYPE,
	NOTIFICATION_TITLE,
	STAR_DATA,
	IMAP_SORT,

	FIREBASE_TOKEN,
	MODULES,
	MODULES_ID

};