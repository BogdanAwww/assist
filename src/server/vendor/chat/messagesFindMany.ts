import {Context} from '@/server/modules/context';
import {Document} from 'mongoose';
import {ChatMessageModel} from '@/server/schema/entities/ChatMessageTC';

interface FilterOptions {
	[option: string]: any;
}

interface SortOptions {
	[option: string]: any;
}

interface MessagesFindManyOptions {
	filter: FilterOptions;
	sort?: SortOptions;
	skip?: number;
	limit?: number;
}

export function messagesFindMany({filter, skip, limit}: MessagesFindManyOptions, ctx?: Context): Promise<Document[]>;
export function messagesFindMany(
	{filter, skip, limit}: MessagesFindManyOptions & {count: true},
	ctx?: Context
): Promise<number>;

export async function messagesFindMany(options: any, _ctx?: Context): Promise<Document[] | number> {
	const {filter, limit, skip, count} = options;
	const query: any = {...filter};
	if (query.after) {
		query.createdAt = {$gte: query.after};
		delete query.after;
	}
	if (query.before) {
		query.createdAt = {$lte: query.before};
		delete query.before;
	}
	if (query.roomId) {
		query.room = query.roomId;
		delete query.roomId;
	}

	if (count) {
		return ChatMessageModel.countDocuments(query);
	}

	const projection = query.$text ? {score: {$meta: 'textScore'}} : undefined;
	let dbQuery = ChatMessageModel.find(query, projection).sort(projection || options.sort || {_id: -1});
	if (skip) {
		dbQuery = dbQuery.skip(skip);
	}
	if (limit) {
		dbQuery = dbQuery.limit(limit);
	}
	return dbQuery;
}
