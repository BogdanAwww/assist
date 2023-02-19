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
			const application = await ProjectApplicationModel.findOne({_id: id});
			if (application) {
				const project = await ProjectModel.findOne({author: user._id, _id: application.get('project')});
				if (project) {
					application.set('isUnread', false);
					return application.save().then((result) => Boolean(result));
				}
			}
		}

		return;
	}
};
