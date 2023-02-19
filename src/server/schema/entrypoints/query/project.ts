import {Context} from '@/server/modules/context';
import {ProjectApplicationModel} from '../../entities/ProjectApplicationTC';
import {ProjectInviteModel} from '../../entities/ProjectInviteTC';
import {ProjectModel, ProjectTC} from '../../entities/ProjectTC';

export default {
	type: ProjectTC,
	args: {
		id: 'String'
	},
	resolve: async (_, {id}, ctx: Context) => {
		const user = ctx.auth.getUser();
		const project = await ProjectModel.findOne({_id: id});
		if (project) {
			const author = project.get('author');
			if (author && user && author.toString() === user._id.toString()) {
				return project;
			}
			const application = user
				? await ProjectApplicationModel.findOne({author: user._id, project: project._id})
				: undefined;
			const invite = user
				? await ProjectInviteModel.findOne({contractor: user._id, project: project._id})
				: undefined;
			const applicationStatus = application?.get('status');
			const inviteStatus = invite?.get('status');
			ctx.showUserContacts = applicationStatus === 'accepted' || inviteStatus === 'accepted';
			if (!application || !application.get('showTest')) {
				const obj = project.toObject({virtuals: true});
				const test = obj.test;
				delete test.description;
				delete test.file;
				return obj;
			}
			return project;
		}
		return;
	}
};
