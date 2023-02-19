import * as redux from 'redux';
import {PlainAction, WithThunkDispatch} from './actions';
import getStateReducer from './reducer';
import thunkMiddleware from './thunk-middleware';

type Store<T> = redux.Store<T, PlainAction<T>> & WithThunkDispatch<T>;

function createStore<T>(state: T): Store<T> {
	const composeEnhancers = window['__REDUX_DEVTOOLS_EXTENSION_COMPOSE__'] || redux.compose;
	const isBrowser = typeof window !== 'undefined';
	const middlewares: redux.Middleware[] = [thunkMiddleware({})];
	const middleware = redux.applyMiddleware<WithThunkDispatch<T>['dispatch']>(...middlewares);
	const store = redux.createStore<T, PlainAction<T>, WithThunkDispatch<T>, {}>(
		getStateReducer(state),
		state as redux.PreloadedState<T>,
		isBrowser ? composeEnhancers(middleware) : middleware
	);

	return store;
}

export default createStore;
export {Store};
