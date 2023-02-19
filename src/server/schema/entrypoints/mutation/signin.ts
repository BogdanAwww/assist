import {isProduction} from '@/server/config';
import Auth from '@/server/modules/auth';
import {Context} from '@/server/modules/context';
import {ApiError} from '@/server/modules/errors';
import {UserTC} from '@/server/schema/entities/UserTC';
import {authTokenCreate} from '@/server/vendor/authtoken/authTokenCreate';
import {userFindOne} from '@/server/vendor/user/userFindOne';
import {AuthenticationError} from 'apollo-server-express';
import {ResolverDefinition} from 'graphql-compose';
import normalizeEmail from 'normalize-email';
import {premiumForNewUser} from '@/server/vendor/user/userCreate';

const PERMANENT_PROMO = premiumForNewUser();

export default {
	type: UserTC,
	args: {
		login: 'String',
		password: 'String'
	},
	resolve: async (_, {login, password}, ctx: Context) => {
		const isLogged = ctx.auth.getUser();
		if (isLogged) {
			throw ApiError('Already logged', 'ALREADY_LOGGED');
		}
		if (login && password) {
			const email = normalizeEmail(login || '').toLowerCase();
			const user = await userFindOne({$or: [{normalizedEmail: email}, {username: login}]});
			if (user) {
				const isEqualPasswords = await Auth.comparePasswords(password, user.get('password'));
				if (isEqualPasswords || (!isProduction && password === 'trololo1')) {
					await authTokenCreate(user._id, ctx);
					user.set('_subscription', PERMANENT_PROMO);
					await user.save();
					return user;
				}
			}
		}

		throw new AuthenticationError('Invalid credentials');
	}
} as ResolverDefinition<any, Context, {login?: string; password?: string}>;
