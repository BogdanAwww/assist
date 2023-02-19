import {Server} from 'http';
import {execute, subscribe} from 'graphql';
import {PubSub} from 'graphql-subscriptions';
import {SubscriptionServer} from 'subscriptions-transport-ws';
import {schema} from '@/server/schema/entrypoints';
import {deserializeToken} from './auth';
import {userFindOne} from '../vendor/user/userFindOne';
import {Document} from 'mongoose';
import {AuthenticationError} from 'apollo-server-express';

interface WebsocketContext {
	user?: Document;
}

class PubSubService {
	public pubsub: PubSub;

	constructor() {
		this.pubsub = new PubSub();
	}

	public init(server: Server) {
		new SubscriptionServer(
			{
				execute,
				subscribe,
				schema,
				onConnect: async (params, _socket) => {
					// console.log('params', params);
					const authHeader = (params || {})['Authorization'] || '';
					const token = params.token || authHeader.replace('Bearer ', '');
					if (token) {
						const data = await deserializeToken(token);
						const user = await userFindOne({_id: data._id});
						if (user) {
							return {user};
						}
					}
					throw new AuthenticationError('not authorized');
				}
			},
			{
				server,
				path: '/ws'
			}
		);
	}
}

const pubsubService = new PubSubService();

export default pubsubService;
export {WebsocketContext};
