import Preloader from '@/common/views/preloader/preloader';
import ResizeListener from '@/common/views/resize-listener/resize-listener';
import appActions from '@/web/actions/app-actions';
import AppState from '@/web/state/app-state';
import React from 'react';
import * as ReactRedux from 'react-redux';

interface SelfProps {
	children: React.ReactNode;
}

interface StateToProps {
	ready: boolean;
	isLoading: boolean;
}

const mapDispatchToProps = {
	initApp: appActions.initApp,
	checkLayout: appActions.checkLayout
};

type ReduxProps = StateToProps & typeof mapDispatchToProps;

type Props = SelfProps & ReduxProps;

const connect = ReactRedux.connect(
	(state: AppState): StateToProps => ({
		ready: Boolean(state.ready && state.i18nReady),
		isLoading: Boolean(state.isLoading)
	}),
	mapDispatchToProps
);

class AppInitiator extends React.PureComponent<Props> {
	componentDidMount() {
		const props = this.props;
		props.initApp();
		props.checkLayout();
	}

	render() {
		const props = this.props;
		return (
			<>
				{props.ready ? this.props.children : null}
				{props.isLoading ? <Preloader overlay /> : null}
				<ResizeListener onResize={props.checkLayout} />
			</>
		);
	}
}

export default connect(AppInitiator);
