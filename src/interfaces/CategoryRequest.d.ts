declare namespace CategoryRequest {

	export interface Id {
		categoryId: string;
	}

	export interface Text extends Pagination {
		searchKey: string;
	}
	export interface Add {
		name: string;
		lowercaseName?: string;
	}

	export interface Delete extends Id {
		status: string;
	}

	export interface Edit extends Id {
		name: string;
		lowercaseName?: string;
		status: string;
	}
}