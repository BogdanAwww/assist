import {Context} from '@/server/modules/context';
import {ApiError} from '@/server/modules/errors';
import mailgunMailer from '@/server/modules/mail';
import notificationManager from '@/server/modules/notifications';
import {getHostUrl} from '@/server/utils/host-utils';
import {getUserQuotaByType, isSubscriptionLevel} from '@/server/utils/user-utils';
import {counterUpdate} from '@/server/vendor/counter/counterUpdate';
import {ProjectApplicationModel, ProjectApplicationTC} from '../../entities/ProjectApplicationTC';
import {ProjectInviteModel} from '../../entities/ProjectInviteTC';
import {ProjectModel} from '../../entities/ProjectTC';
import {UserModel} from '../../entities/UserTC';
import {ProjectApplyInput} from '../../types/inputs/project';

export default {
	type: ProjectApplicationTC,
	args: {
		input: ProjectApplyInput.NonNull
	},
	resolve: async (_, {input}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			const project = await ProjectModel.findOne({_id: input.project, status: 'active'});
			if (!project) {
				throw ApiError('Project not found', 'PROJECT_NOT_FOUND');
			}
			if (!user.get('_info.hasPortfolio')) {
				throw ApiError('Add portfolio', 'EMPTY_PORTFOLIO');
			}
			const existingApplication = await ProjectApplicationModel.findOne({
				project: input.project,
				author: user._id
			});
			if (existingApplication) {
				throw ApiError('Application created', 'ALREADY_APPLIED');
			}

			const quota = getUserQuotaByType(user, 'applications');
			if (quota < 1 && !isSubscriptionLevel(user, 'premium')) {
				throw ApiError('Quota exceeded', 'QUOTA_EXCEEDED');
			}

			const invite = await ProjectInviteModel.findOne({
				project: input.project,
				contractor: user._id,
				status: 'active'
			});
			const application = new ProjectApplicationModel({
				...input,
				author: user.get('_id')
			});
			const savedApplication = await application.save();
			if (savedApplication) {
				counterUpdate('project', input.project, 'applications');
				if (!isSubscriptionLevel(user, 'premium')) {
					user.set('_subscription.quota.applications', quota - 1);
					user.save();
				}
				if (quota === 1) {
					mailgunMailer.send('quota-exceeded-applications', user.get('email'), {
						link: getHostUrl() + '/subscription'
					});
				}
				UserModel.findOne({_id: project.get('author')}).then((projectAuthor) => {
					if (projectAuthor) {
						notificationManager.send(projectAuthor._id, 'new-project-application', {
							project: {type: 'Project', id: project._id},
							user: {type: 'User', id: user._id}
						});
						mailgunMailer.send('project-application', projectAuthor.get('email'), {
							fullName: user.get('fullName'),
							projectTitle: project.get('title'),
							link: getHostUrl() + `/project/${project._id}?id=${savedApplication._id}`
						});
					}
				});
				if (invite) {
					invite.set('status', 'accepted');
					await invite.save();
				}
			}
			return savedApplication;
		}

		return;
	}
};
