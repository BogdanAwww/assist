import {Context} from '@/server/modules/context';
import {projectFindMany} from '@/server/vendor/project/projectFindMany';
import {SearchProjectInput} from '../../types/inputs/project';
import {SearchProjectCountOutput} from '../../types/outputs/project';
import {getFilter} from './searchProjects';

export default {
	type: SearchProjectCountOutput,
	args: {
		filter: SearchProjectInput
	},
	resolve: async (_, {filter}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			const queryFilter = getFilter(filter, user);
			return Promise.all([
				projectFindMany({
					filter: {...queryFilter, period: 'before'},
					count: true
				}),
				projectFindMany({
					filter: {...queryFilter, period: 'inDay'},
					count: true
				}),
				projectFindMany({
					filter: {...queryFilter, period: 'after'},
					count: true
				}),
				projectFindMany({
					filter: {...queryFilter, period: 'whole'},
					count: true
				})
			]).then(([before, inDay, after, whole]) => {
				const total = before + inDay + after + whole || 0;
				return {
					total,
					before,
					inDay,
					after,
					whole
				};
			});
		}
		return;
	}
};
