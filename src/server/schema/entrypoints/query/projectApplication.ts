import {Context} from '@/server/modules/context';
import {ProjectApplicationModel, ProjectApplicationTC} from '../../entities/ProjectApplicationTC';

export default {
	type: ProjectApplicationTC,
	args: {
		id: 'String!'
	},
	resolve: async (_, {id}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			return ProjectApplicationModel.findOne({_id: id});
		}
		return;
	}
};
