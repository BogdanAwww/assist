import {Context} from '@/server/modules/context';
import {authTokenCreate} from '@/server/vendor/authtoken/authTokenCreate';
import {userCreate} from '@/server/vendor/user/userCreate';
import {FriendInviteModel} from '../../entities/FriendInviteTC';
import {UserTC} from '../../entities/UserTC';
import {SignUpInput} from '../../types/inputs/user';
import {parseJSON} from '@/server/utils/data-utils';
import {ApiError} from '@/server/modules/errors';

function readSignupData(data: any): Record<string, string> {
	const result: Record<string, string> = {};
	if (data && typeof data === 'object') {
		for (const key in data) {
			const value = data[key];
			if (typeof value === 'string' && key.startsWith('utm_')) {
				result[key] = value;
			}
		}
	}
	return result;
}

export default {
	type: UserTC,
	args: {
		input: SignUpInput.NonNull,
		data: 'JSON'
	},
	resolve: async (_, {input, data}, ctx: Context) => {
		if (!input.password || !input.password2) {
			throw ApiError('Provide passwords', 'NO_PASSWORD');
		}
		if (input.password !== input.password2) {
			throw ApiError("Passwords doesn't equal", 'NOT_EQUAL_PASSWORDS');
		}

		const user = await userCreate(
			{
				...input,
				_info: {
					utms: readSignupData(parseJSON(data))
				}
			},
			{sendMail: true}
		);
		if (user) {
			await authTokenCreate(user._id, ctx);
			if (input.hash) {
				const invite = await FriendInviteModel.findOne({hash: input.hash, status: 'active'});
				if (invite) {
					invite.set('status', 'accepted');
					await invite.save();
				}
			}
		}
		return user;
	}
};
