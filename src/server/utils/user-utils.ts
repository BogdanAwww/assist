import {Document} from 'mongoose';
import {isValidSubscription, SubscriptionLevel} from '../modules/billing';

const SPECIALTIES_LIMIT = {
	start: 3,
	basic: 3,
	premium: 6
};

function getUserQuotaByType(user: Document, type: string): number {
	const subscription = user.get('_subscription') || {};
	const quota = subscription && isValidSubscription(subscription) ? subscription.quota : {};
	return quota[type] || 0;
}

function isSubscriptionLevel(user: Document, level?: SubscriptionLevel): boolean {
	const subscription = user.get('_subscription') || {};
	return subscription.level === level;
}

function getSpecialtiesLimit(user: Document): number {
	return SPECIALTIES_LIMIT[user.get('_subscription.level') || 'start'] || SPECIALTIES_LIMIT.start;
}

function isSearchAvailable(_viewer: Document | undefined): boolean {
	// const level = viewer?.get('_subscription.level');
	return true; // Boolean(level && level !== 'start'); // > start
}

export {getUserQuotaByType, isSubscriptionLevel, getSpecialtiesLimit, isSearchAvailable};
