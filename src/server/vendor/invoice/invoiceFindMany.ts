import {InvoiceModel} from '@/server/schema/entities/InvoiceTC';
import {Document} from 'mongoose';

interface FilterOptions {
	[option: string]: any;
}

interface FindManyOptions {
	filter: FilterOptions;
	skip?: number;
	limit?: number;
}

export function invoiceFindMany({filter, skip, limit}: FindManyOptions): Promise<Document[]>;
export function invoiceFindMany({filter, skip, limit}: FindManyOptions & {count: true}): Promise<number>;

export async function invoiceFindMany({filter, limit, skip, count}: any): Promise<Document[] | number> {
	if (count) {
		return InvoiceModel.countDocuments(filter);
	}

	let dbQuery = InvoiceModel.find(filter).sort({_id: -1});
	if (skip) {
		dbQuery = dbQuery.skip(skip);
	}
	if (limit) {
		dbQuery = dbQuery.limit(limit);
	}
	return dbQuery;
}
