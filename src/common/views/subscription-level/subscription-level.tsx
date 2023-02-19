import * as React from 'react';
import * as ReactRedux from 'react-redux';
import {Viewer, SubscriptionLevel} from '@/common/types/user';
import AppState from '@/web/state/app-state';

interface StateToProps {
	viewer?: Viewer;
}

type ReduxProps = StateToProps;

interface SelfProps {
	is: SubscriptionLevel | undefined;
	else?: React.ReactNode;
	children?: React.ReactNode;
}

type Props = SelfProps & ReduxProps;

const connect = ReactRedux.connect((state: AppState): StateToProps => ({viewer: state.viewer!}));

class View extends React.PureComponent<Props> {
	render(): React.ReactNode {
		const props = this.props;
		const level = props.viewer?.subscription?.level || undefined;
		if (level !== props.is) {
			return props.else || null;
		}
		return props.children;
	}
}

const SubscriptionLevel = connect(View);

export default SubscriptionLevel;
