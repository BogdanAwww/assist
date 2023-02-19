import {AuthenticationError} from 'apollo-server-express';

export async function checkIsLogged(context: any): Promise<boolean> {
	const isLogged = await context.auth.getUser();
	if (!isLogged) {
		throw new AuthenticationError('not authorized');
	}
	return Boolean(isLogged);
}
