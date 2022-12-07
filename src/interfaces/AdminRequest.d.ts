declare namespace AdminRequest {

	export interface Create {
		name: string;
		email: string;
		password: string;
		created?: number;
	}

	export interface Login extends Device {
		email: string;
		password: string;
		salt: string;
		hash: string;
	}

	export interface ForgotPasswordRequest {
		email: string;
	}
	export interface ComposeMail {
		email: string;
		subject: string;
		message: string;
	}

	export interface ChangeForgotPassword {
		email: string;
		password: string;
		hash?: string;
		token?: string;
	}

	export interface Dashboard extends Filter {
		year?: string;
		month?: string;
		type: string;
		dashboardType?: string;
		corporateId?: string;
	}

	export interface EditProfile {
		profilePicture?: string;
		name: string;
		email: string;
	}

	export interface Dashboard {
		fromDate: number;
		toDate: number;
	}

	export interface UserListing extends ListingRequest {
		userType?: string;
		latestUsers: boolean;
	}
}