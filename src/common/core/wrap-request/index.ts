import {DocumentNode, FetchPolicy} from '@apollo/client';
import {FieldNode, GraphQLError, OperationDefinitionNode} from 'graphql';
import apolloClient from '../apollo-client/apollo-client';

interface RequestOptions {
	fetchPolicy?: FetchPolicy;
}

type Request<Output, InputParams> = (params?: InputParams, options?: RequestOptions) => Promise<Output>;

interface BaseRequestOptions<InputParams> {
	noCache?: boolean;
	getVariables?: (params: InputParams) => any;
	transform?: (data: any) => any;
	mutation?: boolean;
	catch?: boolean;
	context?: any;
}

interface RequestOptionsAsArray<InputParams> extends BaseRequestOptions<InputParams> {
	asArray: true;
}

interface ResponseLike {
	data: any;
	errors?: readonly GraphQLError[];
}

function parseResponse(response: ResponseLike): ResponseLike {
	return {
		data: response.data,
		errors: response.errors
	};
}

function wrapRequest<Output, InputParams = any>(
	query: DocumentNode,
	options?: BaseRequestOptions<InputParams>
): Request<Output | undefined, InputParams>;

function wrapRequest<Output, InputParams = any>(
	query: DocumentNode,
	options?: RequestOptionsAsArray<InputParams>
): Request<Output, InputParams>;

function wrapRequest<Output, InputParams = any>(
	query: DocumentNode,
	options: BaseRequestOptions<InputParams> | RequestOptionsAsArray<InputParams> = {}
): Request<Output | undefined, InputParams> {
	const definitions = query.definitions;
	const operationDefinition = definitions?.find(
		(def) => def.kind === 'OperationDefinition'
	) as OperationDefinitionNode | null;
	const firstSelection = operationDefinition?.selectionSet.selections[0] as FieldNode | undefined;
	const name = operationDefinition?.name?.value || firstSelection?.name.value;
	if (!name) {
		throw new Error('GraphQL operation bad name');
	}
	const queryOptions: any = {};
	if (options.noCache || operationDefinition?.operation === 'mutation') {
		queryOptions.fetchPolicy = 'no-cache';
	}
	if (options.context) {
		queryOptions.context = options.context;
	}
	return async (params: InputParams, reqOpts: RequestOptions = {}) => {
		return new Promise((resolve, reject) => {
			const promiseReject = options.catch ? () => resolve(undefined) : reject;
			const baseOptions = {
				variables: options.getVariables?.(params) || params,
				...queryOptions,
				...reqOpts
			};
			const promise = options.mutation
				? apolloClient.mutate({...baseOptions, mutation: query}).then(parseResponse)
				: apolloClient.query({...baseOptions, query}).then(parseResponse);

			promise
				.then(({data, errors}) => {
					if (errors && errors.length > 0) {
						promiseReject(errors);
					} else {
						const fallback = 'asArray' in options ? [] : undefined;
						let result = data[name] || fallback;
						if (options.transform) {
							result = options.transform(result);
						}
						resolve(result);
					}
				})
				.catch(promiseReject);
		});
	};
}

export {wrapRequest};
