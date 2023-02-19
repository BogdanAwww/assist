import {Context} from '@/server/modules/context';
import {ApiError} from '@/server/modules/errors';
import mailgunMailer from '@/server/modules/mail';
import {getHostUrl} from '@/server/utils/host-utils';
import {UserInputError} from 'apollo-server-express';
import normalizeEmail from 'normalize-email';
import {FriendInviteModel} from '../../entities/FriendInviteTC';
import {UserModel} from '../../entities/UserTC';

const EMAIL_REGEXP =
	/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

export default {
	type: 'Boolean',
	args: {
		email: 'String!'
	},
	resolve: async (_, {email}, ctx: Context) => {
		const user = ctx.auth.getUser();
		const normalizedEmail = normalizeEmail(email.toLowerCase());
		if (user) {
			if (!EMAIL_REGEXP.test(normalizedEmail)) {
				throw new UserInputError('Неправильный адрес');
			}
			const existingUser = await UserModel.findOne({email: normalizedEmail});
			const foundInvite = await FriendInviteModel.findOne({email: normalizedEmail});
			if (!existingUser && !foundInvite) {
				const invite = new FriendInviteModel({
					author: user._id,
					email: normalizedEmail
				});
				await invite.save();
				await mailgunMailer.send(
					'friend-invite',
					normalizedEmail,
					{
						fullName: user.get('fullName'),
						link: getHostUrl(`/signup?hash=${invite.get('hash')}`)
					},
					{skipUserCheck: true}
				);
				return true;
			} else {
				throw ApiError('Пользователь уже приглашен или зарегистрирован', 'USER_EXIST');
			}
		}

		return;
	}
};
