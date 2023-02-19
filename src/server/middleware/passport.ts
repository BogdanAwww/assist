import express from 'express';
import passport from 'passport';
import config from '@/server/config';
import getContext from '@/server/modules/context';
import {ExtractJwt, Strategy as JWTStrategy} from 'passport-jwt';
import {Strategy as FacebookStrategy} from 'passport-facebook';
import {Strategy as GoogleStrategy} from 'passport-google-oauth20';
import {Schema} from 'mongoose';
import {userFindByAuthOrCreate} from '@/server/vendor/user/userFindByAuthOrCreate';
import {authTokenCreate} from '../vendor/authtoken/authTokenCreate';
import {userFindOne} from '../vendor/user/userFindOne';
import {getApiUrl, getHostUrl} from '../utils/host-utils';

const secretOrKey = 'secret';

const opts = {
	jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
	secretOrKey
};

interface StrategyAuthOptions {
	clientID: string;
	clientSecret: string;
	callbackURL: string;
}

function modifyAuthOptions<T extends StrategyAuthOptions>(options: T): StrategyAuthOptions {
	return {
		...options,
		callbackURL: getApiUrl() + options.callbackURL
	};
}

passport.use(
	new JWTStrategy(opts, (payload, done) => {
		userFindOne({_id: payload._id})
			.then((user) => {
				done(null, user);
			})
			.catch(() => {
				done('not found');
			});
	})
);

passport.use(
	new FacebookStrategy(
		modifyAuthOptions({
			...config.facebook.auth,
			profileFields: ['id', 'email', 'name']
		}),
		oauthCallback.bind(null, 'facebook')
	)
);

passport.use(new GoogleStrategy(modifyAuthOptions(config.google.auth), oauthCallback.bind(null, 'google')));

function oauthCallback(type, _accessToken, _refreshToken, profile, cb) {
	// console.log('type', type);
	// console.log(profile);
	const emails = (profile.emails || []).map((item) => item.value).filter(Boolean);
	if (!emails[0]) {
		cb('no-email');
		return;
	}
	const userData = {
		firstName: profile.name.givenName,
		lastName: profile.name.familyName,
		email: emails[0]
	};
	userFindByAuthOrCreate({[`${type}Id`]: profile.id}, userData)
		.then((user) => {
			cb(null, user);
		})
		.catch((err) => {
			console.log(err);
			// TODO: validation error (duplicate fields)
			cb('internal');
		});
}

passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser((id, done) => {
	userFindOne({_id: id as Schema.Types.ObjectId})
		.then((user) => {
			done(null, user);
		})
		.catch((err) => {
			done(err);
		});
});

function authBy(type: string): any {
	return (req: express.Request, res: express.Response, next: express.NextFunction) => {
		passport.authenticate(type, async function (err, user, _info) {
			if (err) {
				return res.redirect(getHostUrl('/signin') + `?error=${err}`);
			}
			if (!user) {
				return res.redirect(getHostUrl('/signin') + '?error=no-user');
			}
			const ctx = await getContext({req, res});
			const token = await authTokenCreate(user._id, ctx);
			const additional = user?.isCreated ? '&signed=true' : '';
			const url = getHostUrl('/auth') + `?token=${token || ''}${additional}`;
			res.redirect(url);
		})(req, res, next);
	};
}

export default passport;
export {authBy};
