import {PromoCodeModel} from '@/server/schema/entities/PromoCodeTC';
import {Document} from 'mongoose';

interface Filter {
	code: string;
	user?: string;
}

export async function getPromoCode(filter: Filter): Promise<Document | null> {
	const query: any = {
		code: filter.code,
		$and: [{$or: [{isUsed: false}, {isUsed: {$exists: false}}]}]
	};

	if (filter.user) {
		query.$and.push({$or: [{user: filter.user}, {user: {$exists: false}}]});
	}

	return PromoCodeModel.findOne(query).populate('template');
}
