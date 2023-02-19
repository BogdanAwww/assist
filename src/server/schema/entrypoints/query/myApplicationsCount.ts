import {Context} from '@/server/modules/context';
import {projectApplicationFindMany} from '@/server/vendor/project-application/projectApplicationFindMany';
import {MyApplicationsCountOutput} from '../../types/outputs/project';

export default {
	type: MyApplicationsCountOutput,
	args: {},
	resolve: async (_, _args, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			return Promise.all([
				projectApplicationFindMany({
					filter: {
						author: user.get('_id'),
						status: 'active'
					},
					count: true
				}),
				projectApplicationFindMany({
					filter: {
						author: user.get('_id'),
						status: 'accepted'
					},
					count: true
				}),
				projectApplicationFindMany({
					filter: {
						author: user.get('_id'),
						status: 'rejected'
					},
					count: true
				})
			]).then(([active, accepted, rejected]) => {
				return {active, accepted, rejected};
			});
		}
		return {active: 0, archived: 0};
	}
};
