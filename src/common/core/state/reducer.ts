import {Reducer} from 'redux';
import applyChanges from '../apply-changes/apply-changes';
import {PlainAction} from './actions';

function getStateReducer<T extends {}>(initialState: T): Reducer<T, PlainAction<T>> {
	return (state, action) => {
		if (!state) {
			return initialState;
		}

		let newState: T | undefined;
		if (action.type === 'EXTEND') {
			newState = {
				...state,
				...action.payload
			};
		}
		if (action.type === 'DEEP_EXTEND') {
			newState = applyChanges(state, action.payload);
		}

		return newState || state;
	};
}

export default getStateReducer;
