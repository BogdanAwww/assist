import {composeWithMongoose} from 'graphql-compose-mongoose';
import mongoose, {Schema} from 'mongoose';
import {getRelationCityById} from '@/server/schema/relations/city';
import generator from 'password-generator';
import {getRelationUploadById} from '../relations/upload';
import {getRelationSpecialtiesByIds} from '../relations/specialty';
import {
	getRelationIsRecommended,
	getRelationSubscriptionStats,
	getRelationUserField,
	getRelationUsersByIds
} from '../relations/user';
import {getRelationCountryById} from '../relations/country';
import parsePhoneNumber from 'libphonenumber-js';
import {Context} from '@/server/modules/context';
import {SubscriptionFields, SubscriptionTC} from './SubscriptionTC';
import {getRelationFavoriteByType} from '../relations/favorite';
import gravatar from 'gravatar';
import {isValidSubscription, SubscriptionLevel} from '@/server/modules/billing';
import {WebsocketContext} from '@/server/modules/pubsub';
import {getLocaleResolver, getLocaleString} from '@/server/utils/i18n-utils';

const schema = new Schema({
	// system
	username: {
		type: String,
		default: () => generator(10, false, /\d/, 'u'),
		unique: true
	},
	password: String,
	facebookId: String,
	googleId: String,

	language: {type: String, enum: ['ru', 'en'], default: () => 'ru'},

	// profile
	firstName: {type: String, default: () => 'Без имени'},
	firstname_en: String,
	lastName: String,
	lastname_en: String,
	email: {type: String},
	normalizedEmail: {type: String},
	avatar: {type: Schema.Types.ObjectId, ref: 'Upload'},
	description: String,
	description_en: String,
	country: {type: Schema.Types.ObjectId, ref: 'Country'},
	city: {type: Schema.Types.ObjectId, ref: 'City'},

	specialties: [{type: Schema.Types.ObjectId, ref: 'Specialty'}],
	recommendations: {
		count: Number,
		last: [{type: Schema.Types.ObjectId, ref: 'User'}]
	},
	contacts: [{type: String}],
	phone: {type: String, set: phoneSetter},
	website: {type: String},
	hidePhone: Boolean,
	hideContacts: Boolean,

	busy: {type: Boolean, default: () => false},
	verified: {type: Boolean, default: () => false},
	isVerified: {type: Boolean, default: () => false},
	_subscription: {type: SubscriptionFields},
	_role: {type: String, enum: ['admin'], default: () => undefined},
	_info: {}
});

schema.set('timestamps', true);

schema.index({
	firstName: 'text',
	lastName: 'text',
	email: 'text',
	description: 'text',
	contacts: 'text',
	website: 'text'
});

schema.virtual('gravatar').get(function (this: any) {
	const email = this.email;
	return email ? gravatar.url(email, {s: 128, d: 'blank', r: 'g'}, true) : undefined;
});

schema.virtual('fullName').get(function (this: {firstName: string; lastName: string}) {
	const parts = [this.firstName, this.lastName].filter(Boolean);
	return parts.join(' ');
});

schema.virtual('isPremium').get(function (this: any) {
	const subscription = this._subscription;
	const now = new Date().getTime();
	return subscription && subscription.level === 'premium' && subscription.end > now;
});

schema.virtual('subscription').get(function (this: any) {
	const subscription = this._subscription;
	const now = new Date().getTime();
	return subscription?.end > now ? subscription : undefined;
});

schema.virtual('demo').get(function (this: any) {
	return Boolean(this._info?.demo);
});

schema.virtual('hasPortfolio').get(function (this: any) {
	return Boolean(this._info?.hasPortfolio);
});

schema.virtual('fullnessScore').get(function (this: any) {
	return this._info?.fullness;
});

schema.virtual('modals').get(function (this: any) {
	return this._info?.modals;
});

export const UserModel = mongoose.model('User', schema);
export const UserTC = composeWithMongoose(UserModel);

UserTC.removeField(['password', '_subscription', '_role', '_info', 'googleId', 'facebookId', 'description_en']);

UserTC.addFields({
	fullName: 'String',
	localeFirstname: getLocaleResolver('firstName', 'firstname_en'),
	localeLastname: getLocaleResolver('lastName', 'lastname_en'),
	localeFullname: {
		type: 'String',
		resolve: (source, _args, ctx: Context) => {
			const values = {
				ru: [source.firstName, source.lastName].filter(Boolean).join(' '),
				en: [source.firstname_en, source.lastname_en].filter(Boolean).join(' ')
			};
			return getLocaleString(values, ctx.lang);
		},
		projection: {firstName: 1, firstname_en: 1, lastName: 1, lastname_en: 1}
	},
	localeDescription: getLocaleResolver('description', 'description_en'),
	gravatar: 'String',
	isPremium: () => getRelationUserField('Boolean', 'isPremium', '_subscription'),
	avatar: () => getRelationUploadById('avatar'),
	country: () => getRelationCountryById('country'),
	city: () => getRelationCityById('city'),
	specialties: () => getRelationSpecialtiesByIds('specialties'),
	subscription: SubscriptionTC,
	subscriptionStats: () => getRelationSubscriptionStats(),
	isFavorite: () => getRelationFavoriteByType('User'),
	isRecommended: () => getRelationIsRecommended(),
	fullnessScore: 'JSON',
	demo: 'Boolean',
	hasPortfolio: 'Boolean',
	modals: 'JSON',
	_info: {
		type: 'JSON',
		resolve: (source, _args, ctx: Context) => (ctx?.isAdminApi ? source.get('_info') : null)
	}
});

UserTC.addNestedFields({
	'recommendations.last': () => getRelationUsersByIds('last')
});

function phoneSetter(value: string): string {
	const phone = parsePhoneNumber(value || '');
	return phone?.formatInternational() || value || '';
}

function hideUserDefinedContacts(user: any) {
	if (user.hidePhone) {
		delete user.phone;
	}
	return user;
}

const ALLOWED_SUB_LEVEL_CONTACTS: SubscriptionLevel[] = ['premium'];

function hideUserContacts(user: any, ctx?: Context | WebsocketContext): any {
	const viewer = ctx ? ('auth' in ctx ? ctx?.auth.getUser() : ctx.user) : undefined;
	const subscription = viewer?.get('_subscription');
	const subscriptionLevel = subscription?.level;
	const canViewContactsBySub =
		isValidSubscription(subscription) && ALLOWED_SUB_LEVEL_CONTACTS.includes(subscriptionLevel);
	const showUserContacts = ctx && 'showUserContacts' in ctx && ctx.showUserContacts;
	const showContacts = canViewContactsBySub || showUserContacts;
	if (showContacts) {
		return hideUserDefinedContacts(user);
	}
	delete user.phone;
	delete user.contacts;
	delete user.email;
	delete user.website;
	return user;
}

function hideSubscription(user: any): any {
	const subscription = user.subscription;
	user.subscription = subscription ? {level: subscription.level} : null;
	user.subscriptionStats = null;
	return user;
}

export function userHideFields(user: any, ctx?: Context | WebsocketContext) {
	if (!user) {
		return null;
	}
	const viewer = ctx ? ('auth' in ctx ? ctx?.auth.getUser() : ctx.user) : undefined;
	const isSelf = viewer && viewer._id.toString() === user._id.toString();
	const isAdmin = viewer?.get('_role') === 'admin';
	if (isSelf || isAdmin || (ctx && 'isAdminApi' in ctx && ctx.isAdminApi)) {
		return user;
	}

	const userObject = user.toObject({virtuals: true});
	hideUserContacts(userObject, ctx);
	hideSubscription(userObject);
	return userObject;
}
