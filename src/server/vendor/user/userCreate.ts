import {createCustomSubscriptionData, getNewSubscription} from '@/server/modules/billing';
import Auth from '@/server/modules/auth';
import {UserModel} from '@/server/schema/entities/UserTC';
import generator from 'password-generator';
import {stringList} from 'aws-sdk/clients/datapipeline';
import normalizeEmail from 'normalize-email';
import {sendVerification} from './sendVerification';
import {ApiError} from '@/server/modules/errors';
import {updateFullnessScore} from './updateFullnessScore';

interface UserData {
	email: string;
	firstName?: string;
	lastName?: string;
	facebookId?: string;
	googleId?: string;
}

interface CreateUserSettings {
	firstName: string;
	lastName?: string;
	avatar?: stringList;
	description: string;
	country?: string;
	city?: string;
	email: string;
	phone?: string;
	website?: string;
	specialties?: string[];
	hideContacts?: boolean;
	password: string;
	password2: string;
}

interface Options {
	sendMail?: boolean;
}

export function premiumForNewUser() {
	const promoData = {
		level: 'premium',
		multiplier: 180,
		discount: 1
	};
	const subscriptionPromoData = createCustomSubscriptionData(promoData);
	const subscription = getNewSubscription(subscriptionPromoData);
	return subscription;
}

export async function userCreate(data: UserData | CreateUserSettings, options: Options = {}) {
	const password = 'password' in data ? data.password : generator(8, true);
	const passwordHash = await Auth.hashPassword(password);
	const email = data.email;
	const normalizedEmail = normalizeEmail(data.email);
	const existingUser = await UserModel.findOne({normalizedEmail});
	if (existingUser) {
		throw ApiError('Email already used', 'EMAIL_ALREADY_USED');
	}
	const user = new UserModel({
		...data,
		email,
		normalizedEmail,
		password: passwordHash
	});
	const PROMO_2021 = premiumForNewUser();
	const authId = user.get('googleId') || user.get('facebookId');
	user.set('verified', Boolean(authId));
	user.set('_subscription', PROMO_2021);
	updateFullnessScore(user);
	await user.save();
	if (options.sendMail) {
		await sendVerification(user, {password});
	}
	return user;
}
