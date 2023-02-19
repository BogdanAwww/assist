import {preparePaginationResolver} from 'graphql-compose-pagination';
import {Context} from '@/server/modules/context';
import {schemaComposer} from 'graphql-compose';
import {userFindMany} from '@/server/vendor/user/userFindMany';
import {UserTC} from '@/server/schema/entities/UserTC';

const findManyResolver = schemaComposer.createResolver({
	name: 'usersMany',
	args: {
		filter: 'JSON',
		skip: 'Int',
		limit: 'Int'
	},
	async resolve({args: {filter, skip, limit}, context}: {args: any; context: Context}) {
		const user = await context.auth.getUser();
		if (user) {
			return userFindMany(
				{
					filter,
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
	name: 'usersCount',
	args: {
		filter: 'JSON'
	},
	async resolve({args, context}: {args: any; context: Context}) {
		const user = await context.auth.getUser();
		if (user) {
			return userFindMany(
				{
					filter: args.filter,
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
	name: 'paginationAdmin',
	perPage: 20
});
