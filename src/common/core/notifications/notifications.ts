import store from '@/web/state/store';
import gql from 'graphql-tag';
import apolloClient from '../apollo-client/apollo-client';
import appActions from '@/web/actions/app-actions';
import {debounce} from 'lodash-es';
import {UserNotification} from '@/common/types/notification';
import notificationActions from '@/web/actions/notification-actions';
import {isActiveTab} from '@/common/core/tab-manager/tab-manager';
import {ObservableSubscription} from '@apollo/client';

import notificationUrl from '@/common/audio/notification.mp3';

const notificationSound = new Audio(notificationUrl);

class NotificationManager {
	private _active?: boolean;
	private _subscription?: ObservableSubscription;
	private _debouncedNotificationsUpdate: (id: string) => void;
	private _ids: string[];

	constructor() {
		this._active = false;
		this._ids = [];

		this._debouncedNotificationsUpdate = debounce((id) => {
			store.dispatch(appActions.updateNotifications(id));
		}, 300);
	}

	notifyLoaded(items: UserNotification[]) {
		const showItems = items.filter((item) => this._ids.includes(item._id));
		showItems.forEach(this._processNotification);
		this._ids = this._ids.filter((id) => showItems.find((notification) => notification._id === id));
	}

	private _processNotification = (notification: UserNotification): void => {
		if (!notification.isUnread) {
			return;
		}
		const action = notificationActions.showNotification({
			data: notification,
			view: 'success',
			timeout: true
		});
		store.dispatch(action);
		if (isActiveTab()) {
			const sound = notificationSound.cloneNode() as HTMLAudioElement;
			sound.volume = 0.7;
			sound.play();
		}
	};

	private _onNotificationReceived = (response: any): void => {
		const id = response.data.notifications;
		this._ids.push(id);
		this._debouncedNotificationsUpdate(id);
	};

	enable(): void {
		if (!this._active) {
			this._active = true;
			this._subscription = apolloClient
				.subscribe({
					query: gql`
						subscription {
							notifications
						}
					`
				})
				.subscribe({
					next: this._onNotificationReceived
				});
		}
	}

	disable(): void {
		this._active = false;
		if (this._subscription) {
			this._subscription.unsubscribe();
			this._subscription = undefined;
		}
	}
}

const notificationManager = new NotificationManager();

export default notificationManager;
