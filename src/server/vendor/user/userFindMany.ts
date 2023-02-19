import {Context} from '@/server/modules/context';
import {userHideFields, UserModel} from '@/server/schema/entities/UserTC';
import {Document, Schema} from 'mongoose';

interface FilterOptions {
	author?: any;
	username?: any;
	specialties?: any[];
	isPremium?: boolean;
	location?: Schema.Types.ObjectId;
	_info?: any;
	[option: string]: any;
}

interface SortOptions {
	[option: string]: any;
}

interface ProjectFindManyOptions {
	filter: FilterOptions;
	sort?: SortOptions;
	skip?: number;
	limit?: number;
	showContacts?: boolean;
}

export function userFindMany({filter, skip, limit}: ProjectFindManyOptions, ctx?: Context): Promise<Document[]>;
export function userFindMany(
	{filter, skip, limit}: ProjectFindManyOptions & {count: true},
	ctx?: Context
): Promise<number>;

export async function userFindMany(options: any, ctx?: Context): Promise<Document[] | number> {
	const {filter, limit, skip, count} = options;
	const query: any = {...filter};
	if (!ctx || (ctx && !ctx.isAdminApi)) {
		query.$and = [{$or: [{verified: true}, {verified: {$exists: false}}]}];
	}
	if ('specialties' in query) {
		if (query.specialties.length > 0) {
			query.specialties = {$elemMatch: {$in: query.specialties}};
		} else {
			delete query.specialties;
		}
	}
	if ('location' in query) {
		if (!query.$and) {
			query.$and = [];
		}
		query.$and.push({$or: [{city: query.location}, {city: {$exists: false}}]});
		delete query.location;
	}
	if ('isPremium' in query) {
		if (query.isPremium) {
			const now = new Date().getTime();
			query['subscription.level'] = 'premium';
			query['subscription.end'] = {$gt: now};
		}
		delete query.isPremium;
	}

	if (count) {
		return UserModel.countDocuments(query);
	}

	const projection = query.$text ? {score: {$meta: 'textScore'}} : undefined;
	let dbQuery = UserModel.find(query, projection).sort(projection || options.sort || {_id: -1});
	if (skip) {
		dbQuery = dbQuery.skip(skip);
	}
	if (limit) {
		dbQuery = dbQuery.limit(limit);
	}
	return dbQuery.then((users) => users?.map((user) => (!options.showContacts ? userHideFields(user, ctx) : user)));
}
