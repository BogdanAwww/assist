import './promo-dialog.css';

import React from 'react';
import {useHistory} from 'react-router';
import Card from '@/common/views/card/card';
import SubscriptionBadge from '@/common/views/subscription-badge/subscription-badge';
import {Viewer} from '@/common/types/user';
import {useSelector, useDispatch} from 'react-redux';
import Dialog from '@/common/views/dialog/dialog';
import AppState from '@/web/state/app-state';
import Button from '@/common/views/button/button';
import classname from '@/common/core/classname';
import {sendMetrics} from '@/web/actions/data-provider';
import appActions from '@/web/actions/app-actions';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';
import {getConvertedLocalePrice} from '@/web/utils/price-utils';

const b = classname('promo-dialog');

const PromoDialog: React.FC<I18nProps> = (props) => {
	const t = props.translates;
	const viewer = useSelector<AppState, Viewer>((store) => store.viewer!);
	const history = useHistory();
	const dispatch = useDispatch();

	const sendMetric = (redirect?) => {
		sendMetrics({type: 'modals_isPromo', data: true}).then(() => {
			dispatch(appActions.updateViewer({...viewer, modals: {...viewer.modals, isPromo: true}}));
			if (redirect) {
				history.push('/subscription');
			}
		});
	};

	return (
		<Dialog isOpen={!viewer.modals?.isPromo} onClose={() => sendMetric()} showClose overlayClose>
			<div className={b('title')}>{t.planDiscount}</div>
			<div className={b('block')}>
				<Card className={b('card')} view="light" rounded shadow>
					<SubscriptionBadge level={'basic'} size="xxl" stretched />

					<div className={b('price-wrapper')}>
						<div className={b('price')}>
							{getConvertedLocalePrice(499, 'RUB', props.lang)}/{t.month} *
						</div>
						<div className={b('second-price')}>
							{getConvertedLocalePrice(5988, 'RUB', props.lang)}/{t.year}
						</div>
						<div className={b('line')} />
					</div>
					<div className={b('third-price')}>
						{getConvertedLocalePrice(2388, 'RUB', props.lang)}/{t.year}
					</div>
				</Card>
				<Card className={b('card')} view="light" rounded shadow>
					<SubscriptionBadge level={'premium'} size="xxl" stretched />

					<div className={b('price-wrapper')}>
						<div className={b('price')}>
							{getConvertedLocalePrice(1999, 'RUB', props.lang)}/{t.month} *
						</div>
						<div className={b('second-price')}>
							{getConvertedLocalePrice(23988, 'RUB', props.lang)}/{t.year}
						</div>
					</div>
					<div className={b('third-price')}>
						{getConvertedLocalePrice(5988, 'RUB', props.lang)}/{t.year}
					</div>
				</Card>
			</div>
			<Button className={b('button')} text={t.buttons.open} onClick={() => sendMetric(true)} />
		</Dialog>
	);
};

export default i18nConnect(PromoDialog);
