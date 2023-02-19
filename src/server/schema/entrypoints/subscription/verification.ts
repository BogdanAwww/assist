import pubsubService, {WebsocketContext} from '@/server/modules/pubsub';

export default {
	type: 'JSON',
	resolve: (payload) => payload,
	subscribe: (_source, _args, context: WebsocketContext) => {
		const user = context.user;
		if (user) {
			return pubsubService.pubsub.asyncIterator('verification_' + user._id);
		}
		return;
	}
};
