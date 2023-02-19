import {Context} from '@/server/modules/context';
import {preparePaginationResolverWithCounter} from '@/server/utils/pagination-utils';
import {projectApplicationFindMany} from '@/server/vendor/project-application/projectApplicationFindMany';
import {schemaComposer} from 'graphql-compose';
import {ProjectApplicationTC} from '../../entities/ProjectApplicationTC';
import {ProjectInviteModel} from '../../entities/ProjectInviteTC';
import {getApplicationsCounter, ProjectApplicationCounterOutput} from '../../relations/project';
import {ProjectApplicationsFilterInput} from '../../types/inputs/project';

const findManyResolver = schemaComposer.createResolver({
	name: 'projectApplicationsMany',
	args: {
		filter: ProjectApplicationsFilterInput,
		skip: 'Int',
		limit: 'Int'
	},
	async resolve({args: {filter, skip, limit}, context}: {args: any; context: Context}) {
		const user = await context.auth.getUser();
		if (user) {
			if (filter.status === 'invites') {
				return ProjectInviteModel.find({project: filter.project, status: 'active'})
					.skip(skip || 0)
					.limit(limit || 20)
					.then((invites) => {
						return invites.map((invite) => {
							return {
								_id: invite._id,
								project: invite.get('project'),
								author: invite.get('contractor'),
								status: 'invited'
							};
						});
					});
			} else {
				return projectApplicationFindMany({
					filter,
					skip,
					limit
				});
			}
		}
		return;
	}
});

const countResolver = schemaComposer.createResolver({
	name: 'projectApplicationsCount',
	args: {
		filter: ProjectApplicationsFilterInput
	},
	async resolve({args: {filter}, context}: {args: any; context: Context}) {
		const user = await context.auth.getUser();
		if (user) {
			return projectApplicationFindMany({
				filter,
				count: true
			});
		}
		return;
	}
});

const counterResolver = schemaComposer.createResolver({
	type: ProjectApplicationCounterOutput,
	name: 'projectApplicationsCounter',
	args: {
		filter: ProjectApplicationsFilterInput
	},
	async resolve({args: {filter}, context}: {source: any; args: any; context: Context}) {
		const user = await context.auth.getUser();
		if (user) {
			return getApplicationsCounter(filter.project);
		}
		return;
	}
});

export default preparePaginationResolverWithCounter(ProjectApplicationTC, {
	findManyResolver,
	countResolver,
	counterResolver,
	name: 'pagination',
	perPage: 20
});
