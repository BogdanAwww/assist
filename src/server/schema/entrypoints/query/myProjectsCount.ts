import {Context} from '@/server/modules/context';
import {projectFindMany} from '@/server/vendor/project/projectFindMany';
import {MyProjectsCountOutput} from '../../types/outputs/project';

export default {
	type: MyProjectsCountOutput,
	args: {},
	resolve: async (_, _args, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			return Promise.all([
				projectFindMany({
					filter: {
						author: user.get('_id'),
						status: 'active'
					},
					count: true
				}),
				projectFindMany({
					filter: {
						author: user.get('_id'),
						status: 'draft'
					},
					count: true
				}),
				projectFindMany({
					filter: {
						author: user.get('_id'),
						status: 'archived'
					},
					count: true
				})
			]).then(([active, draft, archived]) => {
				return {
					active: active || 0,
					draft: draft || 0,
					archived: archived || 0
				};
			});
		}
		return {active: 0, archived: 0};
	}
};
