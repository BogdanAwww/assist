import webConfig from '@/web/config';
import adminConfig from '@/admin/config';
import {ApolloClient, InMemoryCache, ApolloLink, split} from '@apollo/client';
import {WebSocketLink} from '@apollo/client/link/ws';
import {setContext} from '@apollo/client/link/context';
import {getMainDefinition} from '@apollo/client/utilities';
import {parse, stringify} from 'flatted';
import {createUploadLink} from 'apollo-upload-client';
import {getLang} from '@/common/views/translates-provider/translates-provider';

const config = ENTRY === 'admin' ? adminConfig : webConfig;

class TokenManager {
	private _key: string;

	constructor(key: string = 'token') {
		this._key = key;
	}

	get(): string | null {
		return localStorage.getItem(this._key);
	}

	set(value): void {
		localStorage.setItem(this._key, value);
	}
}

const tokenManager = new TokenManager(ENTRY === 'admin' ? 'admtoken' : undefined);

const cleanTypename = new ApolloLink((operation, forward) => {
	const omitTypename = (key, value) => (key === '__typename' ? undefined : value);

	if (operation.variables && !operation.getContext().hasUpload) {
		operation.variables = parse(stringify(operation.variables), omitTypename);
	}

	return forward(operation);
});

const authLink = setContext((_, {headers}) => {
	const token = tokenManager.get();
	return {
		headers: {
			...headers,
			authorization: token ? `Bearer ${token}` : '',
			lang: getLang()
		}
	};
});

const httpLink = createUploadLink({
	uri: config.api + '/graphql',
	isExtractableFile: (value): value is File => value instanceof File
});

const afterwareLink = new ApolloLink((operation, forward) => {
	return forward(operation).map((response) => {
		const context = operation.getContext();
		const token = context.response.headers.get('token');

		if (token) {
			tokenManager.set(token);
		}

		return response;
	});
});

const apiLink = ApolloLink.from([cleanTypename, afterwareLink.concat(httpLink)]);

const wsPath = 'ws' in config ? config.ws + '/ws' : '';
const wsUrl = wsPath.includes('ws://') ? wsPath : `${window.location.origin.replace('http', 'ws')}${wsPath}`;

const wsLink =
	'ws' in config
		? new WebSocketLink({
				uri: wsUrl,
				options: {
					reconnect: true,
					lazy: true,
					inactivityTimeout: 1000,
					connectionParams: () => {
						return {token: tokenManager.get()};
					}
				}
		  })
		: undefined;

const splitLink = wsLink
	? split(
			({query}) => {
				const definition = getMainDefinition(query);
				return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
			},
			wsLink,
			apiLink
	  )
	: apiLink;

const apolloClient = new ApolloClient({
	link: authLink.concat(splitLink),
	cache: new InMemoryCache(),
	credentials: 'same-origin'
});

export default apolloClient;
