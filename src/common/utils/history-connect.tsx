import * as React from 'react';
import contextConnect from '@/common/utils/context-connect';
import {History} from 'history';
import {useHistory} from 'react-router';

interface HistoryProps {
	history: History;
}

const {connect: historyConnect, Provider} = contextConnect<HistoryProps, History>(
	'router',
	undefined as unknown as History, // always persists
	(history) => ({history})
);

function HistoryProvider({children}) {
	const history = useHistory();
	history.block((location, action) => {
		const currentLocation = window.location.pathname + window.location.search;
		const nextLocation = location.pathname + location.search;
		if (action === 'PUSH') {
			const state = location.state as any;
			if (currentLocation === nextLocation && !state?.force) {
				// console.log('block');
				// console.log(location, action);
				// console.log(history.location);
				return false;
			}
		}
		return;
	});
	return <Provider value={history}>{children}</Provider>;
}

export default historyConnect;
export {HistoryProps, HistoryProvider};
