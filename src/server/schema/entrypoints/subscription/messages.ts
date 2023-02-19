import pubsubService, {WebsocketContext} from '@/server/modules/pubsub';
import {ChatMessageUTC} from '../../entities/ChatMessageTC';

export default {
	type: ChatMessageUTC,
	resolve: (payload) => payload,
	subscribe: (_source, _args, context: WebsocketContext) => {
		const user = context.user;
		if (user) {
			return pubsubService.pubsub.asyncIterator('messages_' + user._id);
		}
		return;
	}
};
