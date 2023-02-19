interface PaginationInfo {
	currentPage: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	itemCount: number;
	pageCount: number;
	perPage: number;
}

interface PaginationOutput<T, C = number> {
	items: T[];
	count: C;
	pageInfo: PaginationInfo;
}

interface PaginationInput<F, S = any> {
	filter: F;
	sort?: S;
	perPage?: number;
	page?: number;
}

export {PaginationInfo, PaginationInput, PaginationOutput};
