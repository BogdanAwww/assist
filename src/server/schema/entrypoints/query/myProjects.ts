import {Context} from '@/server/modules/context';
import {projectFindMany} from '@/server/vendor/project/projectFindMany';
import {ProjectTC} from '../../entities/ProjectTC';

export default {
	type: [ProjectTC],
	args: {
		status: 'String'
	},
	resolve: async (_, {status}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			return projectFindMany({
				filter: {
					author: user.get('_id'),
					status
				}
			});
		}
		return;
	}
};
