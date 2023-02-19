import {preparePaginationResolver} from 'graphql-compose-pagination';
import {Context} from '@/server/modules/context';
import {schemaComposer} from 'graphql-compose';
import {Document} from 'mongoose';
import {SearchContractorInput} from '../../types/inputs/user';
import {userFindMany} from '@/server/vendor/user/userFindMany';
import {UserTC} from '../../entities/UserTC';

export function getFilter(filter: any, user: Document) {
	// const now = new Date().getTime();
	return {
		_id: {$ne: user.get('_id')},
		// '_subscription.level': {$exists: true},
		// '_subscription.end': {$gt: now},
		'_info.fullness.contractor': 1,
		...filter
	};
}

const findManyResolver = schemaComposer.createResolver({
	name: 'searchContractorMany',
	args: {
		filter: SearchContractorInput.NonNull,
		skip: 'Int',
		limit: 'Int'
	},
	async resolve({args: {filter, skip, limit}, context}: {args: any; context: Context}) {
		const user = await context.auth.getUser();
		if (user) {
			return userFindMany(
				{
					filter: getFilter(filter, user),
					sort: {'_info.hasPortfolio': -1, _id: -1},
					skip,
					limit
				},
				context
			);
		}
		return;
	}
});

const countResolver = schemaComposer.createResolver({
	name: 'searchContractorCount',
	args: {
		filter: SearchContractorInput.NonNull
	},
	async resolve({args: {filter}, context}: {args: any; context: Context}) {
		const user = await context.auth.getUser();
		if (user) {
			return userFindMany(
				{
					filter: getFilter(filter, user),
					count: true
				},
				context
			);
		}
		return;
	}
});

export default preparePaginationResolver(UserTC, {
	findManyResolver,
	countResolver,
	name: 'pagination',
	perPage: 20
});
