import {Context} from '@/server/modules/context';
import {ApiError} from '@/server/modules/errors';
import {getPromoCode} from '@/server/vendor/promocode/getPromoCode';
import {InvoiceModel} from '../../entities/InvoiceTC';
import {PromoCodeTC} from '../../entities/PromoCodeTC';
import {
	createCustomSubscriptionData,
	getNewSubscription,
	isValidSubscription,
	getProlongedSubscription
} from '@/server/modules/billing';

export default {
	type: PromoCodeTC,
	args: {
		code: 'String'
	},
	resolve: async (_, {code}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			const promocode = await getPromoCode({code, user: user._id});
			if (promocode) {
				const rawCode = promocode.toObject({virtuals: true});
				if (rawCode.user) {
					const isUsed = await InvoiceModel.findOne({'data.code': rawCode.code});
					if (isUsed) {
						throw ApiError('Promocode already used', 'ALREADY_USED');
					}
				} else {
					const promocodes = (user.get('_info') || {}).promocodes || {};
					const isUsed = promocodes[code];
					if (isUsed) {
						throw ApiError('Promocode already used', 'ALREADY_USED');
					} else {
						const template = rawCode.template;
						if (template.type === 'new-subscription') {
							const subscriptionData = createCustomSubscriptionData(template.data);
							const subscription = user.get('_subscription');
							if (subscription && subscription.level !== 'start' && isValidSubscription(subscription)) {
								throw ApiError('User has active subscription', 'USER_HAS_SUBSCRIPTION');
							}
							if (subscriptionData) {
								const newSub = getNewSubscription(subscriptionData);
								user.set('_subscription', newSub);
								user.set(`_info.promocodes.${code}`, true);
								await user.save();
							}
						}
						if (template.type === 'prolong-subscription') {
							const subscriptionData = createCustomSubscriptionData(template.data)!;
							const subscription = user.get('_subscription');
							if (
								subscription &&
								subscription.level !== 'start' &&
								subscription.level !== subscriptionData?.level
							) {
								throw ApiError('User has active subscription', 'USER_HAS_SUBSCRIPTION');
							}
							if (subscriptionData) {
								if (!subscription || subscription.level === 'start') {
									const newSub = getNewSubscription(subscriptionData);
									user.set('_subscription', newSub);
									user.set(`_info.promocodes.${code}`, true);
									await user.save();
								} else {
									const newSub = getProlongedSubscription(subscription, subscriptionData);
									user.set('_subscription', newSub);
									user.set(`_info.promocodes.${code}`, true);
									await user.save();
								}
							}
						}
					}
				}
			}
			return promocode;
		}
		return;
	}
};
