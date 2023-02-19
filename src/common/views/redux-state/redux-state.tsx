import * as React from 'react';
import * as ReactRedux from 'react-redux';
import AppState from '@/web/state/app-state';

interface SelfProps {
	children: (state: AppState) => React.ReactElement;
}

interface StateToProps {
	state: AppState;
}

type Props = SelfProps & StateToProps;

const connect = ReactRedux.connect((state: AppState) => ({state}));

class ReduxState extends React.PureComponent<Props> {
	render(): React.ReactNode {
		const props = this.props;
		return props.children(props.state);
	}
}

export default connect(ReduxState);
