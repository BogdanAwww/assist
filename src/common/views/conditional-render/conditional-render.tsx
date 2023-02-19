import * as React from 'react';
import * as ReactRedux from 'react-redux';
import AppState from '@/web/state/app-state';

interface SelfProps {
	if: (state: AppState) => boolean;
	else?: React.ReactNode;
	children?: React.ReactNode;
}

interface StateToProps {
	state: AppState;
}

type Props = SelfProps & StateToProps;

const connect = ReactRedux.connect((state: AppState) => ({state}));

class View extends React.PureComponent<Props> {
	render(): React.ReactNode {
		const props = this.props;
		const check = props.if(props.state);
		return check ? props.children : props.else || null;
	}
}

const ConditionalRender = connect(View);

export default ConditionalRender;
