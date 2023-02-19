import store from '@/web/state/store';
import apolloClient from '../apollo-client/apollo-client';
import chatActions from '@/web/actions/chat-actions';
import {isActiveTab} from '@/common/core/tab-manager/tab-manager';
import {ObservableSubscription} from '@apollo/client';

import notificationUrl from '@/common/audio/notification.mp3';

const notificationSound = new Audio(notificationUrl);

class MessagesManager {
	private _active?: boolean;
	private _subscription?: ObservableSubscription;

	constructor() {
		this._active = false;
	}

	private _onMessageReceived = (response: any): void => {
		store.dispatch(chatActions.addMessage(response.data.messages));
		store.dispatch(chatActions.getUnreadCount());
		if (isActiveTab()) {
			const sound = notificationSound.cloneNode() as HTMLAudioElement;
			sound.volume = 0.7;
			sound.play();
		}
	};

	enable(): void {
		if (!this._active) {
			this._active = true;
			this._subscription = apolloClient
				.subscribe({
					query: require('@/web/actions/graphql/chat/subscription.graphql')
				})
				.subscribe({
					next: this._onMessageReceived
				});
			store.dispatch(chatActions.getUnreadCount());
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

const messagesManager = new MessagesManager();

export default messagesManager;
