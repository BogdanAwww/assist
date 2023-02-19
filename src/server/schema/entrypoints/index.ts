import {astToSchema, directoryToAst} from 'graphql-compose-modules';
import {schemaComposer} from 'graphql-compose';
import {SchemaDirectiveVisitor} from 'graphql-tools';
import {createRateLimitDirective} from 'graphql-rate-limit-directive';
import {Context} from '@/server/modules/context';
import {ApiError} from '@/server/modules/errors';
import {environment} from '@/server/config';

const ast = directoryToAst(module);
const baseSchemaComposer = astToSchema(ast, {schemaComposer});

baseSchemaComposer.Query.setDescription('Query request');
baseSchemaComposer.Mutation.setDescription('Mutation request');
baseSchemaComposer.Subscription.setDescription('Subscription request');

baseSchemaComposer.addTypeDefs(
	`directive @rateLimit(
        keyPrefix: String
        limit: Int! = 60
        duration: Int! = 60
    ) on OBJECT | FIELD_DEFINITION | FIELD`
);
if (environment !== 'development') {
	baseSchemaComposer.Mutation.setFieldDirectives('signin', [
		{name: 'rateLimit', args: {keyPrefix: 'signin', limit: 10, duration: 60 * 60}}
	]);
}
baseSchemaComposer.Query.setFieldDirectives('isInFirstThousand', [
	{name: 'rateLimit', args: {keyPrefix: 'isInFirstThousand', limit: 10, duration: 10}}
]);

interface RateLimitDirectiveArgs {
	limit: number;
	duration: number;
	keyPrefix?: string;
}

const schemaDirectives = {
	rateLimit: createRateLimitDirective<Context>({
		keyGenerator: (directiveArgs, _source, _args, context, info) => {
			const prefix = (directiveArgs as RateLimitDirectiveArgs).keyPrefix || '';
			const userId = context.auth.getUser()?._id;
			const userKey = userId || context.ip;
			return `${prefix}.${userKey}.${info.parentType.name}.${info.fieldName}`;
		},
		onLimit: (_resource, _directiveArgs, _obj, _args, _context, _info) => {
			// `Too many requests, please try again in ${Math.ceil(resource.msBeforeNext / 1000)} seconds.`
			throw ApiError('Too many requests', 'RATE_LIMIT');
		}
	})
};

export const schema = baseSchemaComposer.buildSchema();
SchemaDirectiveVisitor.visitSchemaDirectives(schema, schemaDirectives);
export {baseSchemaComposer};
