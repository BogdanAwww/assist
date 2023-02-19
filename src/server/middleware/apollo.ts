import express from 'express';
import config, {isProduction} from '@/server/config';
import {ApolloServer, GetMiddlewareOptions, Config} from 'apollo-server-express';
import {graphqlUploadExpress} from 'graphql-upload';
import {schema} from '@/server/schema/entrypoints';
import getContext from '@/server/modules/context';
import {queryCostPlugin} from '@/server/plugins/queryCostPlugin';
import {durationPlugin} from '@/server/plugins/durationPlugin';
import {customTracingPlugin} from '@/server/plugins/customTracingPlugin';
import {apolloServerSentryPlugin} from '@/server/plugins/sentryPlugin';
import mongoose from 'mongoose';

const debug = !isProduction;

const serverOptions: Config = {
	schema,
	context: getContext,
	debug,
	uploads: false,
	plugins: [
		apolloServerSentryPlugin(),
		debug
			? queryCostPlugin({
					schema,
					maxComplexity: config.graphql.maxComplexity || 500
			  })
			: null,
		debug ? durationPlugin() : null,
		debug ? customTracingPlugin() : null
	].filter(Boolean) as any,
	formatError: (error) => {
		const code = error?.extensions?.code;
		if (!debug && (!code || code === 'INTERNAL_SERVER_ERROR')) {
			return new Error('Internal server error');
		}
		return error;
	}
};

const middlewareOptions: GetMiddlewareOptions = {
	path: '/graphql',
	onHealthCheck: () => {
		return new Promise<void>((resolve, reject) => {
			const dbConnection = mongoose.connection;
			if (dbConnection.readyState === dbConnection.states.connected) {
				resolve();
			} else {
				reject();
			}
		});
	},
	cors: {
		credentials: true,
		exposedHeaders: ['token', 'lang'],
		origin: (_origin: string | undefined, callback: any) => callback(null, true)
	}
};

const apolloServer = new ApolloServer(serverOptions);

function applyMiddleware(app: express.Application) {
	app.use(graphqlUploadExpress({maxFileSize: 10000000, maxFiles: 10}));
	apolloServer.applyMiddleware({...middlewareOptions, app});
}

export default applyMiddleware;
