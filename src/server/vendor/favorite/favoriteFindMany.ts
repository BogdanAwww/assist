import {FavoriteModel} from '@/server/schema/entities/FavoriteTC';
import {Document} from 'mongoose';

interface FilterOptions {
	_id?: any;
	user?: any;
	type?: string;
	subject?: any;
	isDeleted?: boolean;
}

interface FindManyOptions {
	filter: FilterOptions;
	skip?: number;
	limit?: number;
}

export function favoriteFindMany({filter, skip, limit}: FindManyOptions): Promise<Document[]>;
export function favoriteFindMany({filter, skip, limit}: FindManyOptions & {count: true}): Promise<number>;

export async function favoriteFindMany(options: any): Promise<Document[] | number> {
	const {filter, limit, skip, count} = options;
	const query: any = {
		...filter
	};

	if (count) {
		return FavoriteModel.countDocuments(query);
	}

	let dbQuery = FavoriteModel.find(query).sort({_id: -1});
	if (skip) {
		dbQuery = dbQuery.skip(skip);
	}
	if (limit) {
		dbQuery = dbQuery.limit(limit);
	}
	return dbQuery;
}
