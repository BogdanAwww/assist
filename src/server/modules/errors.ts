import {ApolloError} from 'apollo-server-express';

export function ApiError(message: string, code: string) {
	return new ApolloError(message, code, {custom: true});
}
