import billing, {UserSubscription} from '@/server/modules/billing';

const DAY = 24 * 60 * 60 * 1000;

const billingRewired = billing as RewiredModule<typeof billing>;

const getSubscriptionData = billingRewired.__get__('getSubscriptionData');
const getProlongedSubscription = billingRewired.__get__('getProlongedSubscription');
const getNewSubscription = billingRewired.__get__('getNewSubscription');
const getUpgradedSubscription = billingRewired.__get__('getUpgradedSubscription');
const getProratePrice = billingRewired.__get__('getProratePrice');

describe('subscription', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should return subscription info premium6', () => {
		const sub = getSubscriptionData('premium', 6);
		expect(sub).toEqual({
			duration: {
				base: 180,
				bonus: 0,
				total: 180
			},
			level: 'premium',
			multiplier: 6,
			discount: 0.4,
			price: 2998.5,
			quota: {
				applications: 0,
				boosts: 60,
				projects: 0
			}
		});
	});

	it('should return subscription info premium12', () => {
		const sub = getSubscriptionData('premium', 12);
		expect(sub).toEqual({
			duration: {
				base: 360,
				bonus: 0,
				total: 360
			},
			level: 'premium',
			multiplier: 12,
			discount: 0.4,
			price: 5997,
			quota: {
				applications: 0,
				boosts: 120,
				projects: 0
			}
		});
	});

	it('should return prolonged subscription', () => {
		const userSub: UserSubscription = {
			start: 0,
			end: 30 * DAY,
			level: 'basic',
			quota: {
				projects: 0,
				applications: 0,
				boosts: 0
			},
			periods: [
				{
					start: 0,
					multiplier: 1,
					duration: {base: 30, bonus: 0, total: 30},
					discount: 0.4,
					quota: {projects: 10, applications: 10, boosts: 0}
				}
			]
		};
		const sub = getSubscriptionData('basic', 1);
		const prolongedSubscription = getProlongedSubscription(userSub, sub);

		expect(prolongedSubscription).toEqual({
			end: 60 * DAY,
			level: 'basic',
			periods: [
				{
					start: 0,
					multiplier: 1,
					discount: 0.4,
					duration: {
						base: 30,
						bonus: 0,
						total: 30
					},
					quota: {
						applications: 10,
						boosts: 0,
						projects: 10
					}
				},
				{
					start: 30 * DAY,
					multiplier: 1,
					discount: 0.4,
					duration: {
						base: 30,
						bonus: 0,
						total: 30
					},
					quota: {
						applications: 20,
						boosts: 3,
						projects: 20
					}
				}
			],
			quota: {
				applications: 20,
				boosts: 3,
				projects: 20
			},
			start: 0
		});
	});

	it('should return new subscription', () => {
		jest.spyOn(Date, 'now').mockImplementationOnce(() => 0);

		const sub = getSubscriptionData('basic', 1);
		const newSubscription = getNewSubscription(sub);

		expect(newSubscription).toEqual({
			start: 0,
			end: 30 * DAY,
			level: 'basic',
			periods: [
				{
					start: 0,
					multiplier: 1,
					discount: 0.4,
					duration: {
						base: 30,
						bonus: 0,
						total: 30
					},
					quota: {
						applications: 20,
						boosts: 3,
						projects: 20
					}
				}
			],
			quota: {
				applications: 20,
				boosts: 3,
				projects: 20
			}
		});
	});

	it('should return upgraded subscription premium with multiplier 1', () => {
		jest.spyOn(Date, 'now').mockImplementation(() => 5 * DAY);

		const userSub: UserSubscription = {
			start: 0,
			end: 30 * DAY,
			level: 'basic',
			quota: {
				projects: 0,
				applications: 0,
				boosts: 0
			},
			periods: [
				{
					start: 0,
					multiplier: 1,
					discount: 1,
					duration: {base: 30, bonus: 0, total: 30},
					quota: {projects: 10, applications: 10, boosts: 0}
				}
			]
		};

		const upgradedSub = getUpgradedSubscription(userSub, 'premium');

		expect(upgradedSub).toEqual({
			start: 0,
			end: 30 * DAY,
			level: 'premium',
			periods: [
				{
					start: 0,
					multiplier: 1,
					discount: 1,
					duration: {
						base: 30,
						bonus: 0,
						total: 30
					},
					quota: {
						applications: 0,
						boosts: 10,
						projects: 0
					}
				}
			],
			quota: {
				applications: 0,
				boosts: 10,
				projects: 0
			}
		});
	});

	it('should return upgraded subscription premium with multiplier 6', () => {
		jest.spyOn(Date, 'now').mockImplementation(() => 120 * DAY);

		const userSub: UserSubscription = {
			start: 0,
			end: 180 * DAY,
			level: 'basic',
			quota: {
				projects: 0,
				applications: 0,
				boosts: 0
			},
			periods: [
				{
					start: 0,
					multiplier: 6,
					discount: 0.9,
					duration: {base: 180, bonus: 0, total: 180},
					quota: {projects: 10, applications: 10, boosts: 0}
				}
			]
		};

		const upgradedSub = getUpgradedSubscription(userSub, 'premium');

		expect(upgradedSub).toEqual({
			start: 0,
			end: 180 * DAY,
			level: 'premium',
			periods: [
				{
					start: 0,
					multiplier: 6,
					discount: 0.9,
					duration: {
						base: 180,
						bonus: 0,
						total: 180
					},

					quota: {
						applications: 0,
						boosts: 60,
						projects: 0
					}
				}
			],
			quota: {
				applications: 0,
				boosts: 60,
				projects: 0
			}
		});
	});

	it('should return upgraded subscription premium with multiple future periods', () => {
		jest.spyOn(Date, 'now').mockImplementation(() => 90 * DAY);

		const userSub: UserSubscription = {
			start: 0,
			end: 360 * DAY,
			level: 'basic',
			quota: {
				projects: 0,
				applications: 0,
				boosts: 0
			},
			periods: [
				{
					start: 0,
					multiplier: 6,
					discount: 0.9,
					duration: {base: 180, bonus: 0, total: 180},
					quota: {projects: 30, applications: 30, boosts: 0}
				},
				{
					start: 180 * DAY,
					multiplier: 6,
					discount: 0.9,
					duration: {base: 180, bonus: 0, total: 180},
					quota: {projects: 30, applications: 30, boosts: 0}
				}
			]
		};

		const upgradedSub = getUpgradedSubscription(userSub, 'premium');

		expect(upgradedSub).toEqual({
			start: 0,
			end: 360 * DAY,
			level: 'premium',
			periods: [
				{
					start: 0,
					multiplier: 6,
					discount: 0.9,
					duration: {base: 180, bonus: 0, total: 180},
					quota: {projects: 0, applications: 0, boosts: 60}
				},
				{
					start: 180 * DAY,
					multiplier: 6,
					discount: 0.9,
					duration: {base: 180, bonus: 0, total: 180},
					quota: {projects: 0, applications: 0, boosts: 60}
				}
			],
			quota: {
				applications: 0,
				boosts: 120,
				projects: 0
			}
		});
	});

	it('should return upgraded subscription premium with multiple future periods', () => {
		jest.spyOn(Date, 'now').mockImplementation(() => 90 * DAY);

		const userSub: UserSubscription = {
			start: 0,
			end: 360 * DAY,
			level: 'basic',
			quota: {
				projects: 0, // used 60
				applications: 0, // used 60
				boosts: 0
			},
			periods: [
				{
					start: 0,
					multiplier: 6,
					discount: 0.9,
					duration: {base: 180, bonus: 0, total: 180},
					quota: {projects: 30, applications: 30, boosts: 0}
				},
				{
					start: 180 * DAY,
					multiplier: 6,
					discount: 0.9,
					duration: {base: 180, bonus: 0, total: 180},
					quota: {projects: 30, applications: 30, boosts: 0}
				}
			]
		};

		const upgradedSub = getUpgradedSubscription(userSub, 'premium');

		expect(upgradedSub).toEqual({
			start: 0,
			end: 360 * DAY,
			level: 'premium',
			periods: [
				{
					start: 0,
					multiplier: 6,
					discount: 0.9,
					duration: {base: 180, bonus: 0, total: 180},
					quota: {projects: 0, applications: 0, boosts: 60}
				},
				{
					start: 180 * DAY,
					multiplier: 6,
					discount: 0.9,
					duration: {base: 180, bonus: 0, total: 180},
					quota: {projects: 0, applications: 0, boosts: 60}
				}
			],
			quota: {
				projects: 0,
				applications: 0,
				boosts: 120
			}
		});
	});

	it('should return prorate price start6 to premium6', () => {
		jest.spyOn(Date, 'now').mockImplementationOnce(() => 0);

		const subscriptionData = getSubscriptionData('start', 6);
		const subscription = getNewSubscription(subscriptionData);

		jest.spyOn(Date, 'now').mockImplementation(() => 90 * DAY);
		const price = getProratePrice(subscription, 'premium');

		// start6 - 540 * 0.5 = 270
		// premium6 - 10800 * 0.5 = 5400
		expect(price).toEqual(599.7); // 5400 - 270
	});

	it('should return prorate price start12 to premium12', () => {
		jest.spyOn(Date, 'now').mockImplementationOnce(() => 0);

		const subscriptionData = getSubscriptionData('start', 12);
		const subscription = getNewSubscription(subscriptionData);

		jest.spyOn(Date, 'now').mockImplementation(() => 180 * DAY);
		const price = getProratePrice(subscription, 'premium');

		// start12 - 1020 * 0.5 = 510
		// premium12 - 20400 * 0.5 = 10200
		expect(price).toEqual(1199.4); // 10200 - 510
	});
});
