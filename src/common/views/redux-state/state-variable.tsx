import * as React from 'react';
import AppState from '@/web/state/app-state';
import ReduxState from './redux-state';

interface Props<T extends any = any> {
	get: (state: AppState) => T;
	children: (state: T) => React.ReactElement;
}

class StateVariable<T> extends React.PureComponent<Props<T>> {
	render(): React.ReactNode {
		const props = this.props;
		return <ReduxState>{(state) => props.children(props.get(state))}</ReduxState>;
	}
}

export default StateVariable;
