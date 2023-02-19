import './subscription-choose.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import {SubscriptionLevel, Viewer} from '@/common/types/user';
import {withRouter, RouteComponentProps} from 'react-router';
import composeConnect from '@/common/core/compose/compose';
import Card from '@/common/views/card/card';
import Button from '@/common/views/button/button';
import AppState from '@/web/state/app-state';
import cloudpayments from '@/common/core/cloudpayments/cloudpayments';
import {getPromoCode, paySubscription} from '@/web/actions/data-provider';
import appActions from '@/web/actions/app-actions';
import SubscriptionBadge from '@/common/views/subscription-badge/subscription-badge';
import Dialog from '@/common/views/dialog/dialog';
import Warning from '@/common/views/warning/warning';
import {Formik, FormikHelpers} from 'formik';
import Input from '@/common/views/input/input';
import notificationActions from '@/web/actions/notification-actions';
import {PromoCode} from '@/common/types/promocode';
import {upperFirst} from 'lodash-es';
import {hasErrorCode} from '@/common/core/apollo-client/errors';
import {TranslatesContext} from '@/common/views/translates-provider/translates-provider';
import {getConvertedLocalePrice} from '@/web/utils/price-utils';

type PaymentAction = 'buy' | 'prolong' | 'upgrade';

const mapDispatchToProps = {
	loadViewer: appActions.loadViewer,
	showNotification: notificationActions.showNotification
};

interface StateToProps {
	viewer: Viewer;
}

type ReduxProps = StateToProps & typeof mapDispatchToProps;

interface SelfProps {}

type Props = SelfProps & ReduxProps & RouteComponentProps;

interface State {
	selectedLevel?: SubscriptionLevel;
	multiplier?: number;
	showPeriodDialog?: boolean;
	loading?: boolean;
	promo?: PromoCode;
	disabled?: boolean;
}

const ACTION_TITLE_RU: Record<PaymentAction, string> = {
	buy: 'Купить',
	prolong: 'Продлить',
	upgrade: 'Улучшить'
};

const ACTION_TITLE_EN: Record<PaymentAction, string> = {
	buy: 'Buy',
	prolong: 'Prolong',
	upgrade: 'Upgrade'
};

interface SubscriptionFeature {
	key: React.ReactNode;
	value: React.ReactNode;
}

interface SubscriptionInfo {
	level: SubscriptionLevel;
	price: number;
	description: React.ReactNode;
	features: SubscriptionFeature[];
}

interface SubscriptionData {
	level: SubscriptionLevel;
	multiplier: number;
	discount: number;
	basePrice: number;
	discountPrice: number;
}

const SUBSCRIPTIONS_RU: SubscriptionInfo[] = [
	{
		level: 'start',
		price: 0,
		description: (
			<>
				Лучшее решение
				<br />
				для новичков в индустрии
			</>
		),
		features: [
			{
				key: 'Заявок/проектов',
				value: (
					<span>
						<b>6</b>/месяц
					</span>
				)
			},
			{
				key: 'Специальностей в профиле',
				value: (
					<span>
						<b>3</b>
					</span>
				)
			},
			{
				key: 'Возможность искать исполнителей и проекты в поиске',
				value: 'Да'
			},
			{
				key: 'Доступ к контактам пользователя',
				value: 'Нет'
			},
			{
				key: 'Возможность продвинуться в топ',
				value: 'Нет'
			},
			// {
			// 	key: 'Профиль без рекламы',
			// 	value: 'Нет'
			// },
			{
				key: 'Техническая поддержка',
				value: 'Только почта'
			}
		]
	},
	{
		level: 'basic',
		price: 499,
		description: (
			<>
				Лучшее решение
				<br />
				для фрилансеров и самозанятых
			</>
		),
		features: [
			{
				key: 'Заявок/проектов',
				value: (
					<span>
						<b>20</b>/месяц
					</span>
				)
			},
			{
				key: 'Специальностей в профиле',
				value: (
					<span>
						<b>3</b>
					</span>
				)
			},
			{
				key: 'Возможность искать исполнителей и проекты в поиске',
				value: 'Да'
			},
			{
				key: 'Доступ к контактам пользователя',
				value: 'Нет'
			},
			{
				key: 'Возможность продвинуться в топ',
				value: (
					<span>
						<b>3</b>/месяц
					</span>
				)
			},
			// {
			// 	key: 'Профиль без рекламы',
			// 	value: 'Да'
			// },
			{
				key: 'Техническая поддержка',
				value: 'Почта, мессенджеры и по телефону'
			}
		]
	},
	{
		level: 'premium',
		price: 1999,
		description: (
			<>
				Лучшее решение
				<br />
				для профессионалов
			</>
		),
		features: [
			{
				key: 'Заявок/проектов',
				value: <b>БЕЗЛИМИТ</b>
			},
			{
				key: 'Специальностей в профиле',
				value: (
					<span>
						<b>6</b>
					</span>
				)
			},
			{
				key: 'Возможность искать исполнителей и проекты в поиске',
				value: 'Да'
			},
			{
				key: 'Доступ к контактам пользователя',
				value: 'Да'
			},
			{
				key: 'Возможность продвинуться в топ',
				value: (
					<span>
						<b>10</b>/месяц
					</span>
				)
			},
			// {
			// 	key: 'Профиль без рекламы',
			// 	value: 'Да'
			// },
			{
				key: 'Техническая поддержка',
				value: 'Почта, мессенджеры и по телефону'
			}
		]
	}
];

const SUBSCRIPTIONS_EN: SubscriptionInfo[] = [
	{
		level: 'start',
		price: 0,
		description: (
			<>
				The best solution
				<br />
				for newcomers to the industry
			</>
		),
		features: [
			{
				key: 'Applications / projects',
				value: (
					<span>
						<b>6</b>/month
					</span>
				)
			},
			{
				key: 'Specialties in profile',
				value: (
					<span>
						<b>3</b>
					</span>
				)
			},
			{
				key: 'The ability to search for performers and projects in the search',
				value: 'Yes'
			},
			{
				key: 'Access to user contacts',
				value: 'No'
			},
			{
				key: 'Opportunity to advance to the top',
				value: 'No'
			},
			// {
			// 	key: 'Профиль без рекламы',
			// 	value: 'Нет'
			// },
			{
				key: 'Technical support',
				value: 'Email only'
			}
		]
	},
	{
		level: 'basic',
		price: 499,
		description: (
			<>
				The best solution
				<br />
				for newcomers to the industry
			</>
		),
		features: [
			{
				key: 'Applications / projects',
				value: (
					<span>
						<b>20</b>/month
					</span>
				)
			},
			{
				key: 'Specialties in profile',
				value: (
					<span>
						<b>3</b>
					</span>
				)
			},
			{
				key: 'The ability to search for performers and projects in the search',
				value: 'Yes'
			},
			{
				key: 'Access to user contacts',
				value: 'No'
			},
			{
				key: 'Opportunity to advance to the top',
				value: (
					<span>
						<b>3</b>/month
					</span>
				)
			},
			// {
			// 	key: 'Профиль без рекламы',
			// 	value: 'Нет'
			// },
			{
				key: 'Technical support',
				value: 'Email only'
			}
		]
	},
	{
		level: 'premium',
		price: 1999,
		description: (
			<>
				The best solution
				<br />
				for newcomers to the industry
			</>
		),
		features: [
			{
				key: 'Applications / projects',
				value: (
					<span>
						<b>Unlimit</b>/month
					</span>
				)
			},
			{
				key: 'Specialties in profile',
				value: (
					<span>
						<b>6</b>
					</span>
				)
			},
			{
				key: 'The ability to search for performers and projects in the search',
				value: 'Yes'
			},
			{
				key: 'Access to user contacts',
				value: 'yes'
			},
			{
				key: 'Opportunity to advance to the top',
				value: (
					<span>
						<b>10</b>/месяц
					</span>
				)
			},
			// {
			// 	key: 'Профиль без рекламы',
			// 	value: 'Нет'
			// },
			{
				key: 'Technical support',
				value: 'Email, messanger and by phone'
			}
		]
	}
];

const MULTIPLIERS = [
	{multiplier: 1, discount: 0.4},
	// {multiplier: 6, discount: 0.9},
	{multiplier: 12, discount: 0.4}
];

const promoInitialValues = {code: ''};

const connect = composeConnect<SelfProps, ReduxProps, RouteComponentProps>(
	ReactRedux.connect((state: AppState): StateToProps => ({viewer: state.viewer!}), mapDispatchToProps),
	withRouter
);

const b = classname('subscription-choose-page');

class SubscriptionChoosePage extends React.PureComponent<Props, State> {
	static contextType = TranslatesContext;
	constructor(props: Props) {
		super(props);

		// const allowed = (window.location.search || '').slice(1).split('&').includes('allow=1');
		this.state = {
			disabled: false // config.env === 'production' && !allowed
		};
	}

	private _selectLevel = (level: SubscriptionLevel, action: PaymentAction): void => {
		this.setState({selectedLevel: level, multiplier: undefined});
		if (action === 'buy') {
			this.setState({showPeriodDialog: true});
		}
		if (action === 'prolong') {
			this.setState({showPeriodDialog: true});
		}
		if (action === 'upgrade') {
			this._pay(level);
			// this.setState({showPeriodDialog: true});
		}
	};

	private _pay = (level: SubscriptionLevel, multiplier?: number): void => {
		const props = this.props;
		const viewer = props.viewer;
		const t = this.context.translates;
		this.setState({loading: true});
		if (viewer?.email) {
			paySubscription({level, multiplier, code: this.state.promo?.code})
				.then((invoice) => {
					if (invoice) {
						return cloudpayments
							.pay(invoice.id, invoice.data.priceKZT)
							.then(() => {
								props.loadViewer();
								this.setState({showPeriodDialog: false});
							})
							.catch(() => {
								props.showNotification({
									view: 'error',
									text: t['errorHasOccured'],
									timeout: true
								});
							});
					}
					return;
				})
				.catch(() => {})
				.finally(() => {
					this.setState({
						promo: undefined,
						selectedLevel: undefined,
						loading: false,
						showPeriodDialog: false
					});
				});
		}
	};

	private _buy = (level, action) => {
		if (this.props.viewer) {
			this._selectLevel(level, action);
		} else {
			localStorage.setItem('fromSubscriptionPage', 'true');
			this.props.history.push('signup');
		}
	};

	private _getSubData = (multiplier: number): SubscriptionData => {
		const level = this.state.selectedLevel!;
		const lang = this.context.lang;
		const SUBSCRIPTIONS = lang === 'ru' ? SUBSCRIPTIONS_RU : SUBSCRIPTIONS_EN;
		const subscription = SUBSCRIPTIONS.find((sub) => sub.level === level);
		// const multiplierInfo = MULTIPLIERS.find((data) => data.multiplier === multiplier);
		// const discount = multiplierInfo?.discount || 1;
		const discount = level === 'premium' ? 0.25 : 0.4;
		const price = (subscription?.price || 0) * multiplier;
		return {
			level,
			multiplier,
			discount,
			basePrice: Math.floor(price),
			discountPrice: Math.floor(price * discount)
		};
	};

	private _getPromoData = (): SubscriptionData | undefined => {
		const promoInfo = this.state.promo;
		const lang = this.context.lang;
		const SUBSCRIPTIONS = lang === 'ru' ? SUBSCRIPTIONS_RU : SUBSCRIPTIONS_EN;
		if (promoInfo?.promo.type === 'subscription') {
			const data = promoInfo.promo.data;
			const sub = SUBSCRIPTIONS.find((sub) => sub.level === data.level)!;
			const price = sub.price * data.multiplier;
			return {
				level: data.level,
				multiplier: data.multiplier,
				discount: data.discount,
				basePrice: Math.floor(price),
				discountPrice: Math.floor(price * data.discount)
			};
		}
		return;
	};

	private _promoSubmit = (values: {code: string}, helpers: FormikHelpers<any>): void => {
		const t = this.context.translates;
		if (values.code) {
			helpers.setSubmitting(true);
			const showNotification = this.props.showNotification;
			getPromoCode({code: values.code.toLowerCase()})
				.then((promoInfo) => {
					const userSubLevel = this.props.viewer?.subscription?.level;
					if (promoInfo) {
						this.props.loadViewer();
						if (promoInfo.promo.type === 'subscription') {
							if (!userSubLevel || userSubLevel === promoInfo.promo.data.level) {
								this.setState({promo: promoInfo, showPeriodDialog: true});
							} else {
								showNotification({
									view: 'error',
									text: t.notifications.promocodeInvalidSubscription.replace(
										'%level',
										upperFirst(promoInfo.promo.data.level)
									),
									timeout: true
								});
							}
						}
						if (
							promoInfo.promo.type === 'new-subscription' ||
							promoInfo.promo.type === 'prolong-subscription'
						) {
							showNotification({
								view: 'success',
								text: t.notifications.promocodeActivated,
								timeout: true
							});
						}
					} else {
						showNotification({
							view: 'error',
							text: t.notifications.promocodeInvalid,
							timeout: true
						});
					}
				})
				.catch((error) => {
					if (hasErrorCode(error, 'ALREADY_USED')) {
						showNotification({
							view: 'error',
							text: t.notifications.promocodeAlreadyUsed,
							timeout: true
						});
					}
					if (hasErrorCode(error, 'USER_HAS_SUBSCRIPTION')) {
						showNotification({
							view: 'error',
							text: t.notifications.promocodeUserHasSubscription,
							timeout: true
						});
					}
				})
				.finally(() => {
					helpers.setSubmitting(false);
				});
		} else {
			helpers.setSubmitting(false);
		}
	};

	private _renderSubscriptionBlock = (sub: SubscriptionInfo, index: number): React.ReactNode => {
		const state = this.state;
		const lang = this.context.lang;
		const t = this.context.translates;
		const ACTION_TITLE = lang === 'ru' ? ACTION_TITLE_RU : ACTION_TITLE_EN;
		const currentSubscription = this.props.viewer.subscription;
		const currentLevel = currentSubscription?.level;
		const action = getPaymentAction(currentLevel, sub.level);
		const secondPrice =
			sub.level === 'premium'
				? `${getConvertedLocalePrice(23988, 'RUB', lang)}/${t['month']}`
				: `${getConvertedLocalePrice(5988, 'RUB', lang)}/${t['month']}`;
		const thirdPrice =
			sub.level === 'premium' ? (
				<b>{getConvertedLocalePrice(5988, 'RUB', lang)}</b>
			) : (
				<b>${getConvertedLocalePrice(2388, 'RUB', lang)}</b>
			);
		return (
			<div className={b('block')} key={index}>
				<Card className={b('card')} view="light" rounded shadow>
					<SubscriptionBadge level={sub.level} size="xxl" stretched />
					{/* <div className={b('description')}>{sub.description}</div> */}
					<div className={b('content')}>{sub.features.map(this._renderInfo)}</div>
					{sub.price ? (
						<>
							<div className={b('price-wrapper')}>
								<div className={b('price')}>
									{getConvertedLocalePrice(sub.price, 'RUB', lang)}/{t['month']} *
								</div>
								<div className={b('second-price')}>{secondPrice}</div>
							</div>
							<div className={b('third-price')}>
								{thirdPrice}/{t['year']}
							</div>
						</>
					) : (
						<div className={b('attention')}>{t['subscriptionDisclaimer']}</div>
					)}
					<div className={b('pay')}>
						<Button
							view="bordered"
							text={!sub.price ? t['free'] : (action && ACTION_TITLE[action]) || t['buy']}
							disabled={
								!sub.price || state.disabled || state.loading || isLowerLevel(currentLevel, sub.level)
							}
							stretched
							onClick={() => this._buy(sub.level, action)}
						/>
					</div>
				</Card>
			</div>
		);
	};

	private _renderInfo = (feature: SubscriptionFeature, index: number) => {
		return (
			<div className={b('info')} key={index}>
				<div className={b('info-title')}>{feature.key}</div>
				<div className={b('info-value')}>{feature.value}</div>
			</div>
		);
	};

	private _renderPeriodCard = (data: SubscriptionData): React.ReactNode => {
		const t = this.context.translates;
		return (
			<Card className={b('dialog-card')} view="light" rounded hoverScale key={data.multiplier}>
				<div className={b('dialog-card-month')}>
					{data.multiplier} {t.month.toLowerCase()}
					{this.context.lang === 'ru' ? (
						<>
							{data.multiplier === 3 ? 'а' : ''}
							{data.multiplier === 6 || data.multiplier === 12 ? 'ев' : ''}
						</>
					) : null}
					{this.context.lang === 'en'
						? data.multiplier === 3 || data.multiplier === 6 || data.multiplier === 12
							? 's'
							: ''
						: null}
				</div>
				<div className={b('dialog-price')}>
					<div className={b('dialog-card-price')}>
						{getConvertedLocalePrice(data.discountPrice, 'RUB', this.context.lang)}
					</div>
					{data.discount < 1 ? (
						<div className={b('dialog-card-price')}>
							<s>{getConvertedLocalePrice(data.basePrice, 'RUB', this.context.lang)}</s>
						</div>
					) : null}
				</div>
				{data.discount < 1 ? (
					<div className={b('dialog-card-bonus')}>
						{Math.floor(100 - data.discount * 100)}% {t.discount}
					</div>
				) : null}
				<Button
					text={t.pay}
					className={b('dialog-button')}
					onClick={() => this._pay(data.level, data.multiplier)}
				/>
			</Card>
		);
	};

	private _renderPeriodDialog = (): React.ReactNode => {
		const t = this.context.translates;
		const state = this.state;
		const level = state.selectedLevel;
		const promoInfo = state.promo;
		const promoData = this._getPromoData();
		if (!level && !promoData) {
			return null;
		}

		return (
			<Dialog
				className={b('dialog')}
				isOpen={this.state.showPeriodDialog}
				onClose={() => this.setState({selectedLevel: undefined, showPeriodDialog: false})}
				overlayClose
				showClose
			>
				<div className={b('dialog-container')}>
					<div className={b('dialog-title')}>{upperFirst(t.payment)}</div>
					<div className={b('dialog-badge')}>
						<SubscriptionBadge level={level} size="xxl" stretched />
					</div>
					<div className={b('dialog-subtitle')}>{t.choosePaymentType}</div>
					{promoData ? (
						<>
							<Warning margin>{promoInfo?.promo.description}</Warning>
						</>
					) : null}
					<div className={b('dialog-cards')}>
						{promoData ? (
							<>{this._renderPeriodCard(promoData)}</>
						) : (
							<>{MULTIPLIERS.map((el) => this._renderPeriodCard(this._getSubData(el.multiplier)))}</>
						)}
					</div>
				</div>
			</Dialog>
		);
	};

	private _renderPromoCode = (): React.ReactNode => {
		if (this.state.disabled) {
			return null;
		}
		const t = this.context.translates;
		return (
			<div className={b('promo')}>
				<Formik initialValues={promoInitialValues} onSubmit={this._promoSubmit}>
					{(form) => (
						<div className={b('promo-line')}>
							<div className={b('promo-text')}>{t['promocode']}</div>
							<div className={b('promo-input')}>
								<Input
									name="code"
									value={form.values.code}
									onChange={form.handleChange}
									disabled={form.isSubmitting}
									maxLength={20}
									noMargin
								/>
							</div>
							<div className={b('promo-button')}>
								<Button text={t['apply']} disabled={form.isSubmitting} onClick={form.submitForm} />
							</div>
						</div>
					)}
				</Formik>
			</div>
		);
	};

	render(): React.ReactNode {
		const subscription = this.props?.viewer?.subscription;
		const level = subscription?.level;
		const date = subscription ? new Date(subscription.end).toLocaleDateString() : undefined;
		const lang = this.context.lang;
		const t = this.context.translates;
		const SUBSCRIPTIONS = lang === 'ru' ? SUBSCRIPTIONS_RU : SUBSCRIPTIONS_EN;
		return (
			<div className={b()}>
				<div className={b('subscription')}>
					<div className={b('subscription-level')}>
						{subscription ? (
							<>
								<span>{t['yourTarif']}</span>
								<SubscriptionBadge level={level} size="medium" />
							</>
						) : (
							<span>{t['chooseTarif']}</span>
						)}
					</div>
					{date && level !== 'start' ? (
						<div className={b('subscription-date')}>
							{t['validUntil']}
							<span>{date}</span>
						</div>
					) : null}
				</div>
				<div className={b('blocks')}>{SUBSCRIPTIONS.map(this._renderSubscriptionBlock)}</div>
				{!subscription ? (
					<Warning warning margin>
						{t.subscriptionWarnings?.[0]}
					</Warning>
				) : null}
				{this.state.disabled ? (
					<Warning warning margin>
						{t.subscriptionWarnings?.[1]}
					</Warning>
				) : null}
				{this._renderPromoCode()}
				<Warning info margin>
					{t.subscriptionWarnings?.[2]}{' '}
					<a className={b('link')} href="https://assist.video/payments" target="_blank" rel="noreferrer">
						{t.subscriptionWarnings?.[3]}
					</a>
					.<br /> {t.subscriptionWarnings?.[4]}
				</Warning>
				<div className={b('back')}>
					<Button view="invisible" text={t['back']} url="/settings" />
				</div>
				{this._renderPeriodDialog()}
			</div>
		);
	}
}

function getPaymentAction(currentLevel: SubscriptionLevel | undefined, level: SubscriptionLevel): PaymentAction {
	if (!currentLevel || currentLevel === 'start') {
		return 'buy';
	}
	if (currentLevel === level) {
		return 'prolong';
	}
	return isLowerLevel(currentLevel, level) ? 'buy' : 'upgrade';
}

function isLowerLevel(currentLevel: SubscriptionLevel | undefined, level: SubscriptionLevel): boolean {
	if (currentLevel === 'basic') {
		return level === 'start';
	}
	if (currentLevel === 'premium') {
		return level === 'start' || level === 'basic';
	}
	return false;
}

export default connect(SubscriptionChoosePage);
