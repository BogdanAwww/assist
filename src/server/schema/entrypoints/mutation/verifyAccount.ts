import {createCustomSubscriptionData, getNewSubscription} from '@/server/modules/billing';
import {Context} from '@/server/modules/context';
import mailgunMailer from '@/server/modules/mail';
import pubsubService from '@/server/modules/pubsub';
import {getHostUrl} from '@/server/utils/host-utils';
import {createPromoCode} from '@/server/vendor/promocode/createPromoCode';
import {userFindMany} from '@/server/vendor/user/userFindMany';
import {ActionConfirmModel} from '../../entities/ActionConfirmTC';
import {UserModel} from '../../entities/UserTC';
import {ApiError} from '@/server/modules/errors';
import {authTokenCreate} from '@/server/vendor/authtoken/authTokenCreate';

const SUB_UNDER_1000 = {
	level: 'premium',
	multiplier: 3,
	discount: 0
};

export default {
	type: 'Boolean',
	args: {
		hash: 'String!'
	},
	resolve: async (_, {hash}, ctx: Context) => {
		const confirmation = await ActionConfirmModel.findOne({hash, isUsed: false});
		if (!confirmation) {
			throw ApiError('invalid hash', 'INVALID_HASH');
		}

		if (confirmation && confirmation.get('expire') < Number(new Date())) {
			throw ApiError('expired hash', 'EXPIRED_HASH');
		}

		const user = await UserModel.findOne({_id: confirmation.get('user')});
		if (!user) {
			throw ApiError('invalid user', 'INVALID_USER');
		}

		user.set('verified', true);

		const userCount = await userFindMany({filter: {verified: true}, count: true});
		if (userCount < 1000) {
			const subscriptionData = createCustomSubscriptionData(SUB_UNDER_1000);
			if (subscriptionData) {
				const firstThousandSub = getNewSubscription(subscriptionData);
				user.set('_subscription', firstThousandSub);
				user.set('_info.first1000', true);
			}
		}

		await user.save();

		const {utm_source, utm_campaign} = user.get('_info.utms') || {};
		if (utm_source === 'bot' && utm_campaign === 'signup') {
			const promo = await createPromoCode({user: user._id, template: 'telegram-signup'});
			const code = promo?.get('code');
			if (code) {
				mailgunMailer.send('promo-70', user.get('email'), {
					code: code.toUpperCase(),
					link: getHostUrl() + '/subscription'
				});
			}
		}

		confirmation.set('isUsed', true);
		await confirmation.save();

		await authTokenCreate(user._id, ctx);

		pubsubService.pubsub.publish('verification_' + user._id.toString(), true);

		return true;
	}
};
