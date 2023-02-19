import {Context} from '@/server/modules/context';
import {projectApplicationFindMany} from '@/server/vendor/project-application/projectApplicationFindMany';
import {schemaComposer} from 'graphql-compose';
import {preparePaginationResolver} from 'graphql-compose-pagination';
import {ProjectApplicationTC} from '../../entities/ProjectApplicationTC';
import {MyApplicationsFilterInput} from '../../types/inputs/project';

const findManyResolver = schemaComposer.createResolver({
	name: 'searchMyApplicationsMany',
	args: {
		filter: MyApplicationsFilterInput,
		skip: 'Int',
		limit: 'Int'
	},
	async resolve({args: {filter, skip, limit}, context}: {args: any; context: Context}) {
		const user = await context.auth.getUser();
		if (user) {
			return projectApplicationFindMany({
				filter: {...filter, author: user._id},
				skip,
				limit
			});
		}
		return;
	}
});

const countResolver = schemaComposer.createResolver({
	name: 'searchMyApplicationsCount',
	args: {
		filter: MyApplicationsFilterInput
	},
	async resolve({args: {filter}, context}: {args: any; context: Context}) {
		const user = await context.auth.getUser();
		if (user) {
			return projectApplicationFindMany({
				filter: {...filter, author: user._id},
				count: true
			});
		}
		return;
	}
});

export default preparePaginationResolver(ProjectApplicationTC, {
	findManyResolver,
	countResolver,
	name: 'MyPagination',
	perPage: 20
});
