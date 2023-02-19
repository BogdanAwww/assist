import {ApolloError, isApolloError} from '@apollo/client';

function hasErrorCode(error: ApolloError | Error, code: string): boolean {
	if (isApolloError(error)) {
		const errors = error.graphQLErrors;
		return Boolean(errors.find((error) => error.extensions?.code === code));
	}
	return false;
}

export {hasErrorCode};
