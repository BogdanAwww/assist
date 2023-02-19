import {ObjectTypeComposer, Resolver} from 'graphql-compose';
import {PaginationResolverOpts, preparePaginationResolver} from 'graphql-compose-pagination';

interface PaginationWithCounterResolverOpts extends PaginationResolverOpts {
	counterResolver: Resolver;
}

function preparePaginationResolverWithCounter<TSource, TContext>(
	tc: ObjectTypeComposer<TSource, TContext>,
	opts: PaginationWithCounterResolverOpts
): Resolver {
	const paginationResolver = preparePaginationResolver(tc, opts);
	const name = paginationResolver.getTypeName();

	const counterResolver = opts.counterResolver;

	paginationResolver.wrapType((outputTC: ObjectTypeComposer) => {
		outputTC.setField('count', counterResolver.getType());
		return outputTC;
	}, name);

	return paginationResolver.wrapResolve(
		(next) => (rp) => {
			return Promise.all([next(rp), counterResolver.resolve(rp)]).then(([result, count]) => {
				return {...result, count};
			});
		},
		name
	);
}

export {preparePaginationResolverWithCounter};
