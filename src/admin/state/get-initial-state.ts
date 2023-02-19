import AppState from './app-state';

function getInitialState(): AppState {
	return {
		ready: false,
		notifications: {list: []},
		countries: []
	};
}

export default getInitialState;
