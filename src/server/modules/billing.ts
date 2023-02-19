import {AuthenticationError, UserInputError} from 'apollo-server-express';
import {Document, Schema} from 'mongoose';
import {isProduction} from '../config';
import {InvoiceModel} from '../schema/entities/InvoiceTC';
import {PromoCodeModel} from '../schema/entities/PromoCodeTC';
import {UserModel} from '../schema/entities/UserTC';
import {getPromoCode} from '../vendor/promocode/getPromoCode';
import {Context} from './context';
import {SystemModel} from '../schema/entities/SystemTC';

type SubscriptionLevel = 'start' | 'basic' | 'premium';

interface SubscriptionQuota {
	projects: number;
	applications: number;
	boosts: number;
}

interface Subscription {
	level: SubscriptionLevel;
	price: number;
	quota: SubscriptionQuota;
}

interface SubscriptionDuration {
	base: number;
	bonus: number;
	total: number;
}

interface SubscriptionPeriod {
	start: number;
	multiplier: number;
	discount: number;
	duration: SubscriptionDuration;
	quota: SubscriptionQuota;
}

interface SubscriptionPack {
	multiplier: number;
	discount: number;
	duration: SubscriptionDuration;
}

type SubscriptionWithMultiplier = Subscription & SubscriptionPack;

interface UserSubscription {
	start: number;
	end: number;
	quota: SubscriptionQuota;
	level: SubscriptionLevel;
	periods: SubscriptionPeriod[];
}

const DAY = 24 * 60 * 60 * 1000;

const BASE_SUBSCRIPTIONS: Subscription[] = [
	{
		level: 'start',
		price: 0,
		quota: {projects: 6, applications: 6, boosts: 0}
	},
	{
		level: 'basic',
		price: 499,
		quota: {projects: 20, applications: 20, boosts: 3}
	},
	{
		level: 'premium',
		price: 1999,
		quota: {projects: 0, applications: 0, boosts: 10}
	}
];

const SUBSCRIPTION_PACKS: SubscriptionPack[] = [
	{
		multiplier: 1,
		// discount: 1,
		discount: 0.4,
		duration: {
			base: 30,
			bonus: 0,
			total: 30
		}
	},
	{
		multiplier: 6,
		// discount: 0.9,
		discount: 0.4,
		duration: {
			base: 180,
			bonus: 0,
			total: 180
		}
	},
	{
		multiplier: 12,
		// discount: 0.85,
		discount: 0.4,
		duration: {
			base: 360,
			bonus: 0,
			total: 360
		}
	}
];

const SUBSCRIPTIONS: SubscriptionWithMultiplier[] = BASE_SUBSCRIPTIONS.reduce((acc, sub) => {
	const subs = SUBSCRIPTION_PACKS.map(({multiplier, duration, discount}) => {
		const actualDiscount = sub.level === 'premium' ? discount - 0.15 : discount;
		return {
			level: sub.level,
			price: sub.price * multiplier * actualDiscount,
			quota: {
				projects: sub.quota.projects * multiplier,
				applications: sub.quota.applications * multiplier,
				boosts: sub.quota.boosts * multiplier
			},
			multiplier,
			discount,
			duration
		};
	});
	return [...acc, ...subs];
}, []);

interface CreateSubsriptionInvoiceData {
	userId: Schema.Types.ObjectId;
	level: string;
	multiplier: number;
	code?: string;
}

class Billing {
	private async _createInvoice(
		ctx: Context,
		userId: Schema.Types.ObjectId,
		type: string,
		data: any
	): Promise<Document> {
		const query = {user: userId, status: 'unused'};
		const exist = await InvoiceModel.findOne(query);
		let invoice: Document | null = exist;
		if (!invoice) {
			const year = new Date().getFullYear();
			const count = await InvoiceModel.find({createdAt: {$gte: new Date(`${year}-1-1`)}}).countDocuments();
			const id = (count + 1).toString().padStart(10, '0');
			invoice = new InvoiceModel({
				user: userId,
				type,
				id: `${year}-${id}`
			});
		}
		const system = await SystemModel.findOne({});
		const RATE_RUB_KZT = system?.get('rate.rubkzt') || 5.6;
		const user = ctx.auth.getUser();
		if (isProduction && user?.get('_role') === 'admin') {
			data.price = 50;
		}
		data.priceKZT = Math.floor(data.price * RATE_RUB_KZT);
		invoice.set('type', type);
		invoice.set('data', data);
		return invoice.save();
	}

	public async createSubscriptionInvoice(
		{userId, level, multiplier = 1, code}: CreateSubsriptionInvoiceData,
		ctx: Context
	): Promise<Document> {
		const user = await UserModel.findOne({_id: userId});
		if (!user) {
			throw new AuthenticationError('not authorized');
		}
		const currentSubscription = user.toObject()._subscription;
		const subscription = isValidSubscription(currentSubscription) ? currentSubscription : undefined;

		const promoInfo = code ? await await getPromoCodeWithData(code, user._id) : undefined;
		const promoData = promoInfo?.promo.type === 'subscription' ? promoInfo.promo.data : undefined;
		if (subscription && promoData && subscription.level !== promoData.level) {
			throw new UserInputError('invalid code');
		}

		const subscriptionData = createCustomSubscriptionData(promoData) || getSubscriptionData(level, multiplier);
		const currentSubscriptionData = subscription?.level
			? getSubscriptionData(subscription?.level, multiplier)
			: undefined;
		if (!subscriptionData || (currentSubscriptionData && subscriptionData.price < currentSubscriptionData.price)) {
			throw new UserInputError('invalid level');
		}
		if (subscription && subscription.level !== 'start' && subscription.level !== level) {
			return this._createInvoice(ctx, userId, 'subscription_upgrade', {
				level,
				multiplier,
				price: getProratePrice(subscription, level)
			});
		}

		return this._createInvoice(ctx, userId, 'subscription', {
			level,
			multiplier,
			price: subscriptionData.price,
			code
		});
	}

	public async successPay(invoiceId?: string): Promise<any> {
		if (!invoiceId) {
			return;
		}
		const invoice = await InvoiceModel.findOne({id: invoiceId});
		if (invoice) {
			invoice.set('status', 'paid');
			invoice.save();

			const data = invoice.get('data');
			const user = await UserModel.findOne({_id: invoice.get('user')});
			if (!user || !data) {
				throw new Error('subscription payment error');
			}

			const userSubscription = getUserSubscription(user);

			const promoInfo = data.code ? await getPromoCodeWithData(data.code, user._id) : undefined;
			const promoData = promoInfo?.promo.type === 'subscription' ? promoInfo.promo.data : undefined;
			if (userSubscription && promoData && userSubscription.level !== promoData.level) {
				throw new UserInputError('invalid code');
			}

			const subscriptionPromoData = createCustomSubscriptionData(promoData);
			const subscriptionData = subscriptionPromoData || getSubscriptionData(data.level, data.multiplier || 1);
			if (!subscriptionData) {
				throw new Error('invalid subscription');
			}

			const type = invoice.get('type');
			let subscription: UserSubscription | undefined;

			if (type === 'subscription') {
				subscription =
					userSubscription && isValidSubscription(userSubscription) && userSubscription.level !== 'start'
						? getProlongedSubscription(userSubscription, subscriptionData)
						: getNewSubscription(subscriptionData);
			}

			if (type === 'subscription_upgrade') {
				subscription = getUpgradedSubscription(userSubscription, subscriptionData.level);
			}

			if (subscription) {
				user.set('_subscription', subscription);
				if (promoInfo && subscriptionPromoData) {
					PromoCodeModel.updateOne({_id: promoInfo._id}, {isUsed: true}).exec();
				}
				return user.save();
			}
		}
	}
}

export function getProlongedSubscription(
	subscription: UserSubscription,
	data: SubscriptionWithMultiplier
): UserSubscription {
	const periods = subscription.periods || [];
	periods.push({
		start: subscription.end,
		multiplier: data.multiplier,
		discount: data.discount,
		duration: data.duration,
		quota: data.quota
	});
	return {
		...subscription,
		end: subscription.end + data.duration.total * DAY,
		periods,
		quota: {
			projects: (subscription.quota.projects || 0) + data.quota.projects,
			applications: (subscription.quota.applications || 0) + data.quota.applications,
			boosts: (subscription.quota.boosts || 0) + data.quota.boosts
		}
	};
}

export function getNewSubscription(data: SubscriptionWithMultiplier | undefined): UserSubscription | undefined {
	if (!data) {
		return;
	}
	const start = new Date(Date.now()).getTime();
	return {
		start,
		end: start + data.duration.total * DAY,
		level: data.level,
		quota: data.quota,
		periods: [
			{
				start,
				multiplier: data.multiplier,
				discount: data.discount,
				duration: data.duration,
				quota: data.quota
			}
		]
	};
}

function getUpgradedSubscription(
	subscription: UserSubscription | undefined,
	level: SubscriptionLevel
): UserSubscription {
	if (!subscription || !isValidSubscription(subscription)) {
		throw new Error('invalid subscription');
	}
	const now = new Date(Date.now()).getTime();
	const periods = subscription.periods || [];
	const activePeriod = periods.find(
		(period) => period.start < now && now < period.start + period.duration.total * DAY
	);
	const nextPeriods = periods.filter((period) => period.start > now);
	const totalQuotaBeforeUpgrade = getSubscriptionQuota(periods);
	const newPeriods = periods.map((period) => {
		const currentPeriodSub = getSubscriptionData(level, period.multiplier);
		if (!currentPeriodSub) {
			return period;
		}
		if (period === activePeriod || nextPeriods.includes(period)) {
			return {
				...period,
				duration: currentPeriodSub.duration,
				quota: currentPeriodSub.quota
			};
		}
		return period;
	});
	const lastPeriod = newPeriods[newPeriods.length - 1];
	const totalQuotaAfterUpgrade = getSubscriptionQuota(newPeriods);
	return {
		...subscription,
		end: lastPeriod.start + lastPeriod.duration.total * DAY,
		level,
		periods: newPeriods,
		quota: {
			projects:
				level === 'premium'
					? 0
					: subscription.quota.projects +
					  (totalQuotaAfterUpgrade.projects - totalQuotaBeforeUpgrade.projects),
			applications:
				level === 'premium'
					? 0
					: subscription.quota.applications +
					  (totalQuotaAfterUpgrade.applications - totalQuotaBeforeUpgrade.applications),
			boosts: subscription.quota.boosts + (totalQuotaAfterUpgrade.boosts - totalQuotaBeforeUpgrade.boosts)
		}
	};
}

function getSubscriptionQuota(periods: SubscriptionPeriod[]): SubscriptionQuota {
	return periods.reduce(
		(acc, period) => {
			acc.projects += period.quota.projects;
			acc.applications += period.quota.applications;
			acc.boosts += period.quota.boosts;
			return acc;
		},
		{
			projects: 0,
			applications: 0,
			boosts: 0
		}
	);
}

function multiplyQuota(quota: SubscriptionQuota, multiplier: number): SubscriptionQuota {
	return {
		projects: Math.floor(quota.projects * multiplier),
		applications: Math.floor(quota.applications * multiplier),
		boosts: Math.floor(quota.boosts * multiplier)
	};
}

function getUserSubscription(user: Document): UserSubscription | undefined {
	return user.toObject()._subscription || undefined;
}

export function getSubscriptionData(level: string, multiplier: number): SubscriptionWithMultiplier | undefined {
	return SUBSCRIPTIONS.find((sub) => sub.level === level && sub.multiplier === multiplier);
}

export function createCustomSubscriptionData(data: any): SubscriptionWithMultiplier | undefined {
	if (!data) {
		return;
	}
	return createSubscriptionData(data.level, {
		multiplier: data.multiplier,
		discount: data.discount,
		duration: {
			base: data.multiplier * 30,
			bonus: 0,
			total: data.multiplier * 30
		}
	});
}

function createSubscriptionData(level: string, options: SubscriptionPack): SubscriptionWithMultiplier | undefined {
	const base = BASE_SUBSCRIPTIONS.find((data) => data.level === level);
	if (!base) {
		return;
	}
	return {
		...base,
		...options,
		price: base.price * options.multiplier * options.discount,
		quota: multiplyQuota(base.quota, options.multiplier)
	};
}

export function isValidSubscription(subscription: UserSubscription): boolean {
	const now = new Date(Date.now()).getTime();
	return Boolean(subscription) && subscription.start <= now && now <= subscription.end;
}

function getProratePrice(subscription: any, level: string): number {
	const periods: SubscriptionPeriod[] = subscription.periods || [];
	const currentSubscriptionData = getSubscriptionData(subscription.level, 1);
	const subscriptionData = getSubscriptionData(level, 1);
	if (!currentSubscriptionData || !subscriptionData) {
		throw new Error('subscription error');
	}
	return periods.reduce((acc, period) => {
		const proportion = getPeriodUsageProportion(period);
		const price =
			(subscriptionData.price - currentSubscriptionData.price) *
			period.multiplier *
			period.discount *
			proportion.estimate;
		return acc + price;
	}, 0);
}

function getPeriodUsageProportion({start, duration}: SubscriptionPeriod): {spent: number; estimate: number} {
	const now = new Date(Date.now()).getTime();
	const durationDays = duration.total;
	const spentTime = start > now ? 0 : now - start;
	const spentDays = Math.ceil(spentTime / DAY);
	const spentDaysPercentage = Math.floor((spentDays / durationDays) * 100) / 100;
	const estimateDaysPercentage = 1 - spentDaysPercentage;
	return {
		spent: spentDaysPercentage,
		estimate: estimateDaysPercentage
	};
}

async function getPromoCodeWithData(code: string, user: string): Promise<any> {
	return getPromoCode({code, user}).then(async (code) => {
		if (!code) {
			return;
		}
		const rawCode = code.toObject({virtuals: true});
		if (!rawCode.user) {
			const isUsed = await InvoiceModel.findOne({'data.code': rawCode.code});
			if (isUsed) {
				throw new UserInputError('already used');
			}
		}
		return {
			...rawCode,
			promo: code?.get('template')
		};
	});
}

const billing = new Billing();

export default billing;
export {UserSubscription, SubscriptionWithMultiplier, SubscriptionLevel};
