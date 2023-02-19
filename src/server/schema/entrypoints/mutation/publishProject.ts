import {Context} from '@/server/modules/context';
import {ProjectModel, ProjectTC} from '../../entities/ProjectTC';

export default {
	type: ProjectTC,
	args: {
		id: 'String!'
	},
	resolve: async (_, {id}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			const project = await ProjectModel.findOne({
				_id: id,
				author: user.get('_id'),
				status: 'draft'
			});
			if (project) {
				if (project.get('endDate')) {
					project.set('endDate', new Date().getTime() + project.get('endDate'));
				}
				project.set('status', 'active');
				return await project.save();
			}
		}

		return;
	}
};
