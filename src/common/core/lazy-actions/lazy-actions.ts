import {PlainAction, ThunkAction} from '@/common/core/state/actions';

type Action<T = {}> = (...args: unknown[]) => PlainAction<T> | ThunkAction<T>;

const cache: Record<string, Record<string, Action>> = {};

type BaseActions<T> = {[key: string]: Action<T>};

function lazyActions<T, Actions extends BaseActions<T>>(
	loader: () => Promise<{default: Actions}>,
	keys: {[K in keyof Actions]: true}
): Actions {
	const cacheKey = loader.toString();
	return (
		(cache[cacheKey] as Actions) ||
		Object.keys(keys).reduce<BaseActions<T>>((acc, name) => {
			acc[name] = ((...args: unknown[]): ThunkAction<T> =>
				(dispatch) => {
					const run = (actions: Actions) => dispatch(actions[name](...args));
					return cache[cacheKey]
						? run(cache[cacheKey] as Actions)
						: loader().then(({default: actions}) => run((cache[cacheKey] = actions)));
				}) as Actions[keyof Actions];
			return acc;
		}, {} as Actions)
	);
}

export default lazyActions;
