import {Context} from '@/server/modules/context';
import mailgunMailer from '@/server/modules/mail';
import notificationManager from '@/server/modules/notifications';
import {getHostUrl} from '@/server/utils/host-utils';
import {userFindOne} from '@/server/vendor/user/userFindOne';
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
				const project = await ProjectModel.findOne({
					author: user._id,
					_id: application.get('project'),
					status: 'active'
				});
				const contractor = await userFindOne({_id: application.get('author')});
				if (project && contractor) {
					application.set('showTest', true);
					mailgunMailer.send('show-test', contractor.get('email'), {
						projectTitle: project.get('title'),
						link: getHostUrl(`/project/${project._id}?role=contractor`)
					});
					notificationManager.send(contractor._id, 'show-test', {
						application: {type: 'Application', id: application._id},
						project: {type: 'Project', id: project._id}
					});
					return application.save().then((result) => Boolean(result));
				}
			}
		}

		return;
	}
};
