import {Context} from '@/server/modules/context';
import {getHostUrl} from '@/server/utils/host-utils';
import mailgunMailer from '@/server/modules/mail';
import {ActionConfirmModel} from '../../entities/ActionConfirmTC';
import {UserModel} from '../../entities/UserTC';
import normalizeEmail from 'normalize-email';

const PASSWORD_RESTORE_EXPIRATION = 60 * 60 * 1000;

export default {
	type: 'Boolean',
	args: {
		login: 'String!'
	},
	resolve: async (_, {login}, _ctx: Context) => {
		if (login) {
			const email = normalizeEmail(login);
			const user = await UserModel.findOne({email});
			if (user) {
				const lastConfirmations = await ActionConfirmModel.find({
					action: 'restore-password',
					user: user._id,
					isUsed: false
				})
					.sort({_id: -1})
					.limit(10)
					.exec();
				const lastConfirmation = lastConfirmations[0];
				if (!lastConfirmation || lastConfirmation.get('expire') < Number(new Date())) {
					const actionConfirm = new ActionConfirmModel({
						user: user._id,
						action: 'restore-password',
						expire: Number(new Date()) + PASSWORD_RESTORE_EXPIRATION
					});
					const savedActionConfirm = await actionConfirm.save();
					const link = getHostUrl() + '/restore-password?hash=' + savedActionConfirm.get('hash');
					mailgunMailer.send('restore-password', user.get('email'), {link});
					return true;
				}
			}
		}

		return false;
	}
};
