import {preparePaginationResolver} from 'graphql-compose-pagination';
import {Context} from '@/server/modules/context';
import {projectFindMany} from '@/server/vendor/project/projectFindMany';
import {SearchProjectInput} from '../../types/inputs/project';
import {ProjectTC} from '../../entities/ProjectTC';
import {schemaComposer} from 'graphql-compose';
import {Document} from 'mongoose';
import {isSearchAvailable} from '@/server/utils/user-utils';

export function getFilter(filter: any, user: Document) {
	return {
		author: {$ne: user.get('_id')},
		status: 'active',
		...filter,
		// location: user.get('city'),
		specialties: user.get('specialties'),
		$and: [
			{
				$or: [{endDate: {$gte: new Date().getTime()}}, {endDate: undefined}, {endDate: {$exists: false}}]
			}
		]
	};
}

const findManyResolver = schemaComposer.createResolver({
	name: 'searchProjectsMany',
	args: {
		filter: SearchProjectInput,
		skip: 'Int',
		limit: 'Int'
	},
	async resolve({args: {filter, skip, limit}, context}: {args: any; context: Context}) {
		const user = context.auth.getUser();
		if (user && isSearchAvailable(user)) {
			return projectFindMany({
				filter: getFilter(filter, user),
				sort: {hot: -1},
				skip,
				limit
			});
		}
		return [];
	}
});

const countResolver = schemaComposer.createResolver({
	name: 'searchProjectsCount',
	args: {
		filter: SearchProjectInput
	},
	async resolve({args: {filter}, context}: {args: any; context: Context}) {
		const user = context.auth.getUser();
		if (user && isSearchAvailable(user)) {
			return projectFindMany({
				filter: getFilter(filter, user),
				count: true
			});
		}
		return 0;
	}
});

export default preparePaginationResolver(ProjectTC, {
	findManyResolver,
	countResolver,
	name: 'pagination',
	perPage: 20
});
