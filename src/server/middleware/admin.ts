import {ApolloServer} from 'apollo-server-express';
import {schema} from '@/server/schema/entrypoints/admin';
import getContext, {ContextOptions} from '@/server/modules/context';

const contextOptions: ContextOptions = {
	isAdminApi: true
};

const apolloServer = new ApolloServer({
	schema,
	context: (context) => getContext(context, contextOptions)
});

const adminApolloMiddleware = apolloServer.getMiddleware({
	path: '/kr4m0a/graphql',
	disableHealthCheck: true,
	cors: {
		credentials: true,
		exposedHeaders: ['token', 'lang'],
		origin: (_origin: string | undefined, callback: any) => callback(null, true)
	}
});

export default adminApolloMiddleware;
