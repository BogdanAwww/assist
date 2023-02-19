import {preparePaginationResolver} from 'graphql-compose-pagination';
import {Context} from '@/server/modules/context';
import {schemaComposer} from 'graphql-compose';
import {projectFindMany} from '@/server/vendor/project/projectFindMany';
import {ProjectTC} from '@/server/schema/entities/ProjectTC';

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
			return projectFindMany({
				filter,
				skip,
				limit
			});
		}
		return;
	}
});

const countResolver = schemaComposer.createResolver({
	name: 'usersCount',
	args: {filter: 'JSON'},
	async resolve({args, context}: {args: any; context: Context}) {
		const user = await context.auth.getUser();
		if (user) {
			return projectFindMany({
				filter: args.filter,
				count: true
			});
		}
		return;
	}
});

export default preparePaginationResolver(ProjectTC, {
	findManyResolver,
	countResolver,
	name: 'paginationAdmin',
	perPage: 20
});
