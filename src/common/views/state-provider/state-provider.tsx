import * as React from 'react';
import * as ReactRedux from 'react-redux';
import redux from 'redux';

interface Props<Store> {
	store: Store;
}

class StateProvider<Store extends redux.Store> extends React.PureComponent<Props<Store>> {
	render(): React.ReactNode {
		const props = this.props;
		return <ReactRedux.Provider store={props.store}>{props.children}</ReactRedux.Provider>;
	}
}

export default StateProvider;
