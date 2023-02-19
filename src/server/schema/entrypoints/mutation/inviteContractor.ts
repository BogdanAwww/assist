import {Context} from '@/server/modules/context';
import mailgunMailer from '@/server/modules/mail';
import notificationManager from '@/server/modules/notifications';
import {getHostUrl} from '@/server/utils/host-utils';
import {ProjectApplicationModel} from '../../entities/ProjectApplicationTC';
import {ProjectInviteModel} from '../../entities/ProjectInviteTC';
import {ProjectModel} from '../../entities/ProjectTC';
import {UserModel} from '../../entities/UserTC';
import {InviteContractorInput} from '../../types/inputs/project-invite';
import {ApiError} from '@/server/modules/errors';

export default {
	type: 'Boolean',
	args: {
		input: InviteContractorInput.NonNull
	},
	resolve: async (_, {input}, ctx: Context) => {
		const user = ctx.auth.getUser();
		const contractor = await UserModel.findOne({_id: input.contractor});
		const projects = await ProjectModel.find({_id: {$in: input.projects}});
		if (user && contractor && projects.length > 0) {
			if (contractor.get('busy')) {
				throw ApiError('Contractor is busy', 'USER_BUSY');
			}
			const foundInvites = await ProjectInviteModel.find({
				project: {$in: input.projects},
				author: user._id,
				contractor: contractor._id,
				status: 'active'
			});
			return Promise.all(
				projects.map(async (project) => {
					const isSent =
						(foundInvites || []).filter((invite) =>
							input.projects.includes(invite.get('project').toString())
						).length > 0;
					if (isSent) {
						// console.log('already sent');
						return true;
					}
					const application = await ProjectApplicationModel.findOne({
						author: contractor._id,
						project: project._id
					});
					if (application) {
						return true;
					}
					const invite = new ProjectInviteModel({
						project,
						author: user._id,
						contractor: contractor._id
					});
					await invite.save();
					mailgunMailer.send('project-invite', contractor.get('email'), {
						projectTitle: project.get('title'),
						link: getHostUrl(`/project/${project._id}?role=contractor`)
					});
					notificationManager.send(contractor._id, 'project-invite', {
						project: {type: 'Project', id: project._id}
					});
					return;
				})
			).then(() => {
				return true;
			});
		}

		return;
	}
};
