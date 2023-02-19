import * as React from 'react';
import {withRouter, RouteComponentProps} from 'react-router-dom';
import config from '@/web/config';
import {sendMetrics} from '@/web/actions/data-provider';

type Props = RouteComponentProps;

class AuthPage extends React.PureComponent<Props> {
	componentDidMount() {
		const props = this.props;
		const search = (props.location?.search?.slice(1) || '').split('&').map((item) => item.split('='));
		const [, token] = search.find((item) => item[0] === 'token') || [];
		const [, signed] = search.find((item) => item[0] === 'signed') || [];
		const utms = localStorage.getItem('utms');
		if (signed && utms) {
			sendMetrics({type: 'utms', data: utms}).finally(() => this._redirect(token));
		} else {
			this._redirect(token);
		}
	}

	private _redirect = (token?: string): void => {
		if (token) {
			localStorage.setItem('token', token);
			window.location.href = config.baseUrl + 'choose-role';
		} else {
			window.location.href = config.baseUrl + 'signin';
		}
	};

	render(): React.ReactNode {
		return <></>;
	}
}

export default withRouter(AuthPage);
