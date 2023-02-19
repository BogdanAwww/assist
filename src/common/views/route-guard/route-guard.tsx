import * as React from 'react';
import * as ReactRedux from 'react-redux';
import {Redirect, RouteComponentProps, withRouter} from 'react-router';

interface BaseAppState {
	ready: boolean;
}

interface SelfProps<AppState> {
	children: React.ReactNode;
	redirectTo?: string;
	check: (state: AppState) => string | boolean;
	state: AppState;
}

interface State {
	redirect?: boolean;
}

type Props<AppState> = SelfProps<AppState> & RouteComponentProps;

const connect = ReactRedux.connect((state) => ({state}));

class RouteGuard<AppState extends BaseAppState> extends React.PureComponent<Props<AppState>, State> {
	constructor(props: Props<AppState>) {
		super(props);

		const path = this._getRedirectPath();
		this.state = {
			redirect: Boolean(path !== props.history.location.pathname)
		};
	}

	private _getRedirectPath = (): string | undefined => {
		const props = this.props;
		const check = props.check(props.state);
		if (typeof check === 'boolean') {
			return check ? props.redirectTo : undefined;
		}
		return typeof check === 'string' ? check : undefined;
	};

	render() {
		const props = this.props;
		const state = this.state;
		const ready = props.state.ready;
		if (!ready) {
			return null;
		}
		if (state.redirect) {
			const path = this._getRedirectPath();
			if (path && path !== props.history.location.pathname) {
				return <Redirect to={path} />;
			}
		}
		return props.children as React.ReactElement<any>;
	}
}

export default withRouter(connect(RouteGuard));
