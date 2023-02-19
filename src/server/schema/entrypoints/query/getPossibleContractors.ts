import {sampleSize} from 'lodash';
import {Context} from '@/server/modules/context';
import {UserTC} from '../../entities/UserTC';
import {ProjectModel} from '../../entities/ProjectTC';
import {userFindMany} from '@/server/vendor/user/userFindMany';

export default {
	type: [UserTC],
	args: {
		projectId: 'String'
	},
	resolve: async (_, {projectId}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			const project = await ProjectModel.findOne({_id: projectId, author: user._id});
			if (!project) {
				return;
			}
			const filter = project.location
				? {
						_id: {$ne: user.get('_id')},
						'_info.fullness.contractor': 1,
						specialties: project.get('specialties'),
						location: project.get('location')
				  }
				: {
						_id: {$ne: user.get('_id')},
						'_info.fullness.contractor': 1,
						specialties: project.get('specialties')
				  };
			const users = await userFindMany({
				filter,
				limit: 100
			});
			return sampleSize(users, 20);
		}
		return;
	}
};
