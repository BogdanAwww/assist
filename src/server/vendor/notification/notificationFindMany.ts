import {NotificationModel} from '@/server/schema/entities/NotificationTC';
import {Document} from 'mongoose';

interface FilterOptions {
	user?: any;
	isUnread?: boolean;
	ts?: any;
}

interface FindManyOptions {
	filter: FilterOptions;
	skip?: number;
	limit?: number;
}

export function notificationFindMany({filter, skip, limit}: FindManyOptions): Promise<Document[]>;
export function notificationFindMany({filter, skip, limit}: FindManyOptions & {count: true}): Promise<number>;

export async function notificationFindMany(options: any): Promise<Document[] | number> {
	const {filter, limit, skip, count} = options;
	const query: any = {
		...filter
	};

	if (count) {
		return NotificationModel.countDocuments(query);
	}

	let dbQuery = NotificationModel.find(query).sort({_id: -1});
	if (skip) {
		dbQuery = dbQuery.skip(skip);
	}
	if (limit) {
		dbQuery = dbQuery.limit(limit);
	}
	return dbQuery;
}
