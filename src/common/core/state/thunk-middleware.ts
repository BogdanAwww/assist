import {Action as ReduxAction} from 'redux';
import {RawThunkMiddleware} from './actions';

/**
 * @see https://github.com/gaearon/redux-thunk
 */
function thunkMiddleware<State = {}, A extends ReduxAction = ReduxAction, ExtraArgument = Record<string, unknown>>(
	extraArgument: ExtraArgument
): RawThunkMiddleware<State, A, ExtraArgument> {
	return (api) => (next) => (action) =>
		typeof action === 'function' ? action(api.dispatch, api.getState, extraArgument) : next(action);
}

export default thunkMiddleware;
