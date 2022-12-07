declare namespace RoleRequest {

	export interface CreateRole {
		role: string;
		permission: object;
	}

	export interface EditRole {
		roleId: string;
		role?: string;
		permission?: object;
	}

	export interface BlockUnblockRole {
		roleId: string;
		status: number
	}

	export interface RoleId {
		roleId: string;
	}

	export interface CreateSubAdmin {
		roleId: string;
		name: string;
		email: string;
		password: string;
		userType: string;
	}

	export interface EditSubAdmin {
		adminId: string;
		name?: string;
		roleId?: string;
	}

	export interface BlockSubAdmin {
		adminId: string;
		status: number;
	}

	export interface AdminId {
		adminId: string;
	}

	export interface SubAdminList extends ListingRequest {
		roleId?: string;
	}
}