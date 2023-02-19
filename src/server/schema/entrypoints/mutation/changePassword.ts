import Auth from '@/server/modules/auth';
import {Context} from '@/server/modules/context';
import {UserInputError} from 'apollo-server-express';

export default {
	type: 'Boolean',
	args: {
		password: 'String',
		newPassword: 'String',
		newPassword2: 'String'
	},
	resolve: async (_, {password, newPassword, newPassword2}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			const isEqualPasswords = await Auth.comparePasswords(password, user.get('password'));
			if (isEqualPasswords) {
				if (newPassword === newPassword2) {
					const passwordHash = await Auth.hashPassword(newPassword);
					user.set('password', passwordHash);
					await user.save();
					return true;
				} else {
					throw new UserInputError('Пароли не совпадают');
				}
			} else {
				throw new UserInputError('Пароль не подходит');
			}
		}

		return false;
	}
};
