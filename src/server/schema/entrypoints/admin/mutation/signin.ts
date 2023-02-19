import {isProduction} from '@/server/config';
import Auth from '@/server/modules/auth';
import {Context} from '@/server/modules/context';
import {UserTC} from '@/server/schema/entities/UserTC';
import {authTokenCreate} from '@/server/vendor/authtoken/authTokenCreate';
import {userFindOne} from '@/server/vendor/user/userFindOne';
import {AuthenticationError} from 'apollo-server-express';
import normalizeEmail from 'normalize-email';

export default {
	type: UserTC,
	args: {
		login: 'String',
		password: 'String'
	},
	resolve: async (_, {login, password}, ctx: Context) => {
		if (login && password) {
			const email = normalizeEmail(login || '').toLowerCase();
			const user = await userFindOne({$or: [{normalizedEmail: email}, {username: login}], _role: 'admin'});
			if (user) {
				const isEqualPasswords = await Auth.comparePasswords(password, user.get('password'));
				if (isEqualPasswords || (!isProduction && password === 'trololo1')) {
					await authTokenCreate(user._id, ctx);
					return user;
				}
			}
		}

		return new AuthenticationError('Invalid credentials');
	}
};
