import {MESSAGE_FOR_HIRERS, MESSAGE_FOR_TALENTS} from './../../../modules/assist-helper';
import {sendMessageUtil} from '../../../utils/messenger-utils';
import {getAssistHelper} from './../../../modules/assist-helper';
import {Context} from '@/server/modules/context';
import mailgunMailer from '@/server/modules/mail';
import {getHostUrl} from '@/server/utils/host-utils';
import {parseJSON} from '@/server/utils/data-utils';
import {upperFirst} from 'lodash';

const SIGNUP_THRESHOLD = 10 * 60 * 1000; // 10 minutes
const ROLES = ['employer', 'contractor'];
const MODALS_FIELDS = [
	'isFirstSignIn',
	'isFirstPublishedProject',
	'isFirstAdviceInPortfolio',
	'firstProjectInPortfolio',
	'isFirstProjectsSearch',
	'isPromo'
];

export default {
	type: 'JSON',
	args: {
		type: 'String!',
		data: 'JSON!'
	},
	resolve: async (_, {type, data}, ctx: Context) => {
		const user = ctx.auth.getUser();
		const separateType = type.split('_');
		if (user) {
			const userData = user.toObject();
			const userSignedDate = new Date(userData.createdAt).getTime();
			const now = new Date().getTime();
			const info = userData._info || {};
			if (type === 'utms' && now - userSignedDate < SIGNUP_THRESHOLD && !info.utms) {
				const utmsData = parseJSON(data);
				if (utmsData && typeof utmsData === 'object') {
					user.set('_info.utms', utmsData);
					user.save();
					// const {
					// 	utm_source,
					// 	// utm_medium,
					// 	utm_campaign
					// 	// utm_content,
					// 	// utm_term
					// } = utmsData;
				}
			} else if (type === 'set-role' && ROLES.includes(data)) {
				const role = data;
				const key = `tried${upperFirst(role)}Role`;
				if (!info[key]) {
					user.set(`_info.${key}`, new Date().getTime());
					user.save();
					const mailTemplate = role === 'employer' ? 'first-role-employer' : 'first-role-contractor';
					mailgunMailer.send(mailTemplate, user.get('email'), {
						editProfileLink: getHostUrl() + `/settings?role=${role}`,
						addProjectLink: getHostUrl() + '/projects?role=employer',
						portfolioLink: getHostUrl() + '/portfolio?role=contractor'
					});
				}
				const chatKey = `assistHelperFor${upperFirst(role)}`;
				if (!info[chatKey]) {
					user.set(`_info.${chatKey}`, new Date().getTime());
					user.save();
					const assistHelper = await getAssistHelper();
					sendMessageUtil(assistHelper._id, {
						userId: user._id,
						type: 'text',
						content: role === 'employer' ? MESSAGE_FOR_HIRERS : MESSAGE_FOR_TALENTS,
						file: ''
					});
				}
			} else if (separateType[0] === 'modals' && MODALS_FIELDS.includes(separateType[1])) {
				const field = separateType[1];
				const state = data;
				user.set(`_info.modals.${field}`, state);
				user.save();
				return {
					statusCode: 200
				};
			} else if (type === 'set-language') {
				user.set('language', data);
				user.save();
				return;
			}
		}

		return;
	}
};
