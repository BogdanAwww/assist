import {SubscriptionLevel} from './user';

interface SubscriptionData {
	level: SubscriptionLevel;
	multiplier: number;
	discount: number;
}

interface SubscriptionPromoData {
	type: 'subscription' | 'new-subscription' | 'prolong-subscription';
	data: SubscriptionData;
	description: string;
}

type PromoData = SubscriptionPromoData;

interface PromoCode {
	code: string;
	promo: PromoData;
}

export {PromoCode};
