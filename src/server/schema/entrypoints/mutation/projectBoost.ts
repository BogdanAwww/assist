import {Context} from '@/server/modules/context';
import {ApiError} from '@/server/modules/errors';
import mailgunMailer from '@/server/modules/mail';
import {getHostUrl} from '@/server/utils/host-utils';
import {getUserQuotaByType} from '@/server/utils/user-utils';
import {ProjectModel} from '../../entities/ProjectTC';

export default {
	type: 'Boolean',
	args: {
		id: 'String!'
	},
	resolve: async (_, {id}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			const project = await ProjectModel.findOne({
				_id: id,
				author: user._id,
				status: 'active'
			});
			if (!project) {
				throw ApiError('Project not found', 'PROJECT_NOT_FOUND');
			}
			if (project.get('hot')) {
				throw ApiError('Project already boosted', 'ALREADY_BOOSTED');
			}

			const quota = getUserQuotaByType(user, 'boosts');
			if (quota < 1) {
				throw ApiError('Quota exceeded', 'QUOTA_EXCEEDED');
			}

			project.set('hot', true);
			await project.save();
			user.set('_subscription.quota.boosts', quota - 1);
			user.save();
			if (quota === 1) {
				mailgunMailer.send('quota-exceeded-boosts', user.get('email'), {
					link: getHostUrl() + '/subscription'
				});
			}
			return true;
		}

		return;
	}
};
