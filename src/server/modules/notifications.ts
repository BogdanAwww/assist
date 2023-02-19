import {Schema} from 'mongoose';
import {NotificationModel} from '../schema/entities/NotificationTC';
import pubsubService from './pubsub';
import {queueManager} from './queue';

class NotificationManager {
	public async send(
		userId: string | Schema.Types.ObjectId | null,
		type: string,
		subjects: Record<string, any>
	): Promise<void> {
		if (!userId) {
			return;
		}
		const notification = new NotificationModel({
			type,
			user: userId,
			subjects
		});
		const savedNotification = await notification.save();
		this._notify(userId, savedNotification._id);
	}

	private _notify(id: string | Schema.Types.ObjectId, data: any): void {
		pubsubService.pubsub.publish('notifications_' + id.toString(), data);
	}
}

const notificationManager = new NotificationManager();

const notificationsQueue = queueManager.getQueue('NOTIFICATIONS', {isWorker: true, sendEvents: false, getEvents: true});

interface RedisNotificationData {
	id: string;
	type: string;
	data: Record<string, any>;
}

notificationsQueue.process(async ({data}: {data: RedisNotificationData}, done) => {
	await notificationManager.send(data.id, data.type, data.data);
	done(null);
});

export default notificationManager;
