import {ProjectModel} from '@/server/schema/entities/ProjectTC';
import {Document, Schema} from 'mongoose';

interface FilterOptions {
	author?: any;
	status: string;
	specialties?: any[];
	type?: string;
	period?: string;
	hasTest?: boolean;
	budgetFrom?: number;
	paycheckType?: string;
	paycheckAmount?: number;
	nonCommercial?: boolean;
	onlyPremium?: boolean;
	location?: Schema.Types.ObjectId;
	endData?: any;
}

interface SortOptions {
	hot?: number;
}

interface ProjectFindManyOptions {
	filter: FilterOptions;
	sort?: SortOptions;
	skip?: number;
	limit?: number;
}

export function projectFindMany(options: ProjectFindManyOptions): Promise<Document[]>;
export function projectFindMany(options: ProjectFindManyOptions & {count: true}): Promise<number>;

export async function projectFindMany(options: any): Promise<Document[] | number> {
	const {filter, limit, skip, count} = options;
	const query: any = {
		...filter
	};
	if ('hideTest' in query) {
		if (query.hideTest) {
			query['test.description'] = '';
			query['test.file'] = {$exists: false};
		}
		delete query.hideTest;
	}
	if ('specialties' in query) {
		query.specialties = {$elemMatch: {$in: query.specialties}};
	}
	if ('paycheckType' in query) {
		query['paycheck.type'] = query.paycheckType;
	}
	if ('paycheckAmount' in query && query.paycheckAmount > 0) {
		query['paycheck.amount'] = {$gte: query.paycheckAmount};
	}
	delete query.paycheckType;
	delete query.paycheckAmount;
	if ('budgetFrom' in query) {
		query.budget = {$gte: query.budgetFrom || 0};
	}
	delete query.budgetFrom;
	if (!query.nonCommercial) {
		delete query.nonCommercial;
	} else {
		delete query.budget;
		delete query['paycheck.amount'];
		delete query['paycheck.type'];
	}
	if (!query.onlyPremium) {
		delete query.onlyPremium;
	}
	if ('location' in query) {
		const $or = [{location: query.location}, {location: {$exists: false}}];
		if (query.$and) {
			query.$and.push($or);
		} else {
			query.$or = $or;
		}
		delete query.location;
	}

	if (count) {
		return ProjectModel.countDocuments(query);
	}

	let sortQuery: any = {_id: -1};

	if (options.sort?.hot) {
		sortQuery = {hot: options.sort.hot, ...sortQuery};
	}

	let dbQuery = ProjectModel.find(query).sort(sortQuery);
	if (skip) {
		dbQuery = dbQuery.skip(skip);
	}
	if (limit) {
		dbQuery = dbQuery.limit(limit);
	}
	return dbQuery;
}
