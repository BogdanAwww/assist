import * as Sentry from '@sentry/node';
import type {ApolloServerPlugin} from 'apollo-server-plugin-base';
import {Context} from '../modules/context';
// import logger from '../modules/logger';

const ALLOWED_CODES = ['UNAUTHENTICATED', 'BAD_USER_INPUT'];

function apolloServerSentryPlugin() {
	return {
		async requestDidStart(): Promise<any> {
			return {
				didEncounterErrors(rc) {
					Sentry.withScope((scope) => {
						const context = rc.context as Context;

						scope.addEventProcessor((event) => Sentry.Handlers.parseRequest(event, context.req));

						const user = context.auth.getUser();
						if (user) {
							scope.setUser({
								id: user._id,
								ip_address: context.ip,
								email: user.get('email')
							});
						} else if (context.ip) {
							scope.setUser({
								ip_address: context.ip
							});
						}

						scope.setTags({
							graphql: rc.operation?.operation || 'parse_err',
							graphqlName: (rc.operationName as any) || (rc.request.operationName as any)
						});

						rc.errors.forEach((error) => {
							const extenstions = error?.extensions || {};
							const code = extenstions.code;
							const isCustom = extenstions.custom;
							// logger.error(error.message);
							if (!isCustom && (!code || !ALLOWED_CODES.includes(code))) {
								if (error.path || error.name !== 'GraphQLError') {
									scope.setExtras({
										path: error.path
									});
									Sentry.captureException(error);
								} else {
									scope.setExtras({});
									Sentry.captureMessage(`GraphQLWrongQuery: ${error.message}`);
								}
							}
						});
					});
				}
			};
		}
	} as ApolloServerPlugin;
}

export {apolloServerSentryPlugin};
