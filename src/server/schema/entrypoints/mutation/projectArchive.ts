import {Context} from '@/server/modules/context';
import {ProjectApplicationModel} from '../../entities/ProjectApplicationTC';
import {ProjectModel} from '../../entities/ProjectTC';

export default {
	type: 'Boolean',
	args: {
		id: 'String!'
	},
	resolve: async (_, {id}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			const project = await ProjectModel.findOne({_id: id, author: user._id, status: 'active'});
			if (project) {
				project.set('status', 'archived');
				await project.save();
			}
			ProjectApplicationModel.updateMany({project: id, status: 'active'}, {$set: {status: 'rejected'}}).exec();
			return true;
		}

		return;
	}
};
