import {Context} from '@/server/modules/context';
import {ApiError} from '@/server/modules/errors';
import mailgunMailer from '@/server/modules/mail';
import {getHostUrl} from '@/server/utils/host-utils';
import {getUserQuotaByType, isSubscriptionLevel} from '@/server/utils/user-utils';
import {ProjectModel, ProjectTC} from '../../entities/ProjectTC';
import {CreateProjectInput} from '../../types/inputs/project';
import {queueManager} from '@/server/modules/queue';

const NOTIFICATION_DELAY = 2 * 60 * 1000; // 2 min

export default {
	type: ProjectTC,
	args: {
		input: CreateProjectInput.NonNull
	},
	resolve: async (_, {input}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			const quota = getUserQuotaByType(user, 'projects');
			if (quota < 1 && !isSubscriptionLevel(user, 'premium')) {
				throw ApiError('Quota exceeded', 'QUOTA_EXCEEDED');
			}

			input.paycheck.currency = ctx.lang === 'en' ? 'USD' : 'RUB';

			const project = new ProjectModel({...input, author: user.get('_id')});
			const savedProject = await project.save();
			if (savedProject) {
				queueManager.createJob(
					'PROJECT_CREATED',
					{_id: savedProject._id.toString()},
					{delay: NOTIFICATION_DELAY}
				);
				if (!isSubscriptionLevel(user, 'premium')) {
					user.set('_subscription.quota.projects', quota - 1);
					user.save();
				}
				if (quota === 1) {
					mailgunMailer.send('quota-exceeded-projects', user.get('email'), {
						link: getHostUrl() + '/subscription'
					});
				}
			}
			return savedProject;
		}

		return;
	}
};
