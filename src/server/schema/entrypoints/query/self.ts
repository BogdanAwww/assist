import {UserTC} from '@/server/schema/entities/UserTC';
import {getSubscriptionData, getNewSubscription, getProlongedSubscription} from '@/server/modules/billing';
import {Context} from '@/server/modules/context';
import {AuthenticationError} from 'apollo-server-express';
import {updateFullnessScore} from '@/server/vendor/user/updateFullnessScore';
import {getSpecialtiesLimit} from '@/server/utils/user-utils';

const SUB_RENEW = 5 * 24 * 60 * 60 * 1000;

export default {
	type: UserTC,
	args: {},
	resolve: async (_, _args, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (!user) {
			throw new AuthenticationError('not authorized');
		}
		const subscription = user.get('_subscription');
		const now = new Date().getTime();
		const subData = getSubscriptionData('start', 1);
		let sub: any;
		if (!subscription) {
			sub = subData && getNewSubscription(subData);
		} else if (subscription.level === 'start') {
			if (subscription.start < now && now + SUB_RENEW > subscription.end) {
				sub = subData && getProlongedSubscription(subscription, subData);
			} else if (subscription.end < now) {
				sub = subData && getNewSubscription(subData);
			}
		} else if (subscription.end < now) {
			sub = subData && getNewSubscription(subData);
		}
		if (sub) {
			user.set('_subscription', sub);
		}
		if (!user.get('_info.fullness')) {
			updateFullnessScore(user);
		}
		const specialties = user.get('specialties') || [];
		const specialtiesLimit = getSpecialtiesLimit(user);
		if (specialties.length > specialtiesLimit) {
			user.set('specialties', specialties.slice(0, specialtiesLimit));
		}
		if (user.isModified()) {
			return user.save();
		}
		return user;
	}
};
