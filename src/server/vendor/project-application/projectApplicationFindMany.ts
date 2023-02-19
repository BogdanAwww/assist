import {ProjectApplicationModel} from '@/server/schema/entities/ProjectApplicationTC';
import {Document} from 'mongoose';

interface FilterOptions {
	_id?: any;
	project?: any;
	author?: string;
	status?: any;
	isUnread?: boolean;
	showTest?: boolean;
}

interface FindManyOptions {
	filter: FilterOptions;
	skip?: number;
	limit?: number;
}

export function projectApplicationFindMany({filter, skip, limit}: FindManyOptions): Promise<Document[]>;
export function projectApplicationFindMany({filter, skip, limit}: FindManyOptions & {count: true}): Promise<number>;

export async function projectApplicationFindMany(options: any): Promise<Document[] | number> {
	const {filter, limit, skip, count} = options;

	if (count) {
		return ProjectApplicationModel.countDocuments(filter);
	}

	let dbQuery = ProjectApplicationModel.find(filter).sort({_id: -1});
	if (skip) {
		dbQuery = dbQuery.skip(skip);
	}
	if (limit) {
		dbQuery = dbQuery.limit(limit);
	}
	return dbQuery;
}
