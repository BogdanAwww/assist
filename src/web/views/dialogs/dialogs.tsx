import './dialogs.css';

import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import Dialog from '@/common/views/dialog/dialog';
import AppState from '@/web/state/app-state';
import {NotificationDialog} from '@/web/state/app-state';
import Button from '@/common/views/button/button';
import classname from '@/common/core/classname';
import {UserNotification} from '@/common/types/notification';
import notificationActions from '@/web/actions/notification-actions';
import appActions from '@/web/actions/app-actions';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';

const b = classname('dialogs');

const Dialogs: React.FC<I18nProps> = (props) => {
	const showDialog = useSelector<AppState, NotificationDialog>((store) => store.notificationDialog);
	const dispatch = useDispatch();

	const onCloseWithRedirect = (item?: UserNotification | null) => {
		if (item) {
			dispatch(notificationActions.action(item));
		}
		dispatch(appActions.showNotificationDialog(false, null));
	};

	const t = props.translates;
	const showContent = (item: UserNotification | null) => {
		switch (item?.type) {
			case 'application-accept': {
				return (
					<div className={b('wrapper')}>
						<div className={b('title')}>{t.dialogs.choosenAsContractor.title}</div>
						<div className={b('list-title')}>{t.dialogs.choosenAsContractor.listTitle}</div>
						<ul className={b('list')}>
							<li className={b('list__item')}>{t.dialogs.choosenAsContractor.listItems[0]}</li>
							<li className={b('list__item')}>{t.dialogs.choosenAsContractor.listItems[1]}</li>
							<li className={b('list__item')}>{t.dialogs.choosenAsContractor.listItems[2]}</li>
							<li className={b('list__item')}>{t.dialogs.choosenAsContractor.listItems[3]}</li>
						</ul>
						<div className={b('subtitle')}>{t.dialogs.choosenAsContractor.subtitle[0]}</div>
						<div className={b('subtitle')}>{t.dialogs.choosenAsContractor.subtitle[1]}</div>
						<div className={b('subtitle')}>{t.dialogs.choosenAsContractor.subtitle[2]}</div>
						<Button
							className={b('button')}
							text={t.buttons.open}
							onClick={() => onCloseWithRedirect(item)}
						/>
					</div>
				);
			}
			default: {
				return null;
			}
		}
	};

	return (
		<Dialog isOpen={showDialog.status} onClose={() => onCloseWithRedirect()} showClose overlayClose>
			{showContent(showDialog?.item)}
		</Dialog>
	);
};

export default i18nConnect(Dialogs);
