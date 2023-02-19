import {Schema, Document} from 'mongoose';
import pubsubService from './pubsub';

class MessagesManager {
	public async send(userId: string | Schema.Types.ObjectId | null, room: Document, message: Document): Promise<void> {
		if (!userId) {
			return;
		}
		const users = room.get('users') || [];
		users.forEach((user) => {
			const recepientId = user._id.toString();
			if (recepientId !== userId.toString()) {
				this._notify(recepientId, message);
			}
		});
	}

	private _notify(id: string | Schema.Types.ObjectId, data: any): void {
		pubsubService.pubsub.publish('messages_' + id.toString(), data);
	}
}

const messagesManager = new MessagesManager();

export default messagesManager;
