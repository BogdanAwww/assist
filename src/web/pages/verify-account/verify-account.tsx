import * as React from 'react';
import * as ReactRedux from 'react-redux';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {verifyAccount} from '@/web/actions/data-provider';
import {hasErrorCode} from '@/common/core/apollo-client/errors';
import notificationActions from '@/web/actions/notification-actions';
import qs from 'qs';
import appActions from '@/web/actions/app-actions';
import {translates} from '@/common/views/translates-provider/translates-provider';

const mapDispatchToProps = {
	showNotification: notificationActions.showNotification,
	loadViewer: appActions.loadViewer
};

type Props = typeof mapDispatchToProps & RouteComponentProps<{hash: string}>;

const connect = ReactRedux.connect(null, mapDispatchToProps);

class Page extends React.Component<Props> {
	componentDidMount() {
		const props = this.props;
		const search = qs.parse(props.location.search, {ignoreQueryPrefix: true}) || {};
		const hash = search.hash?.toString();
		if (!hash) {
			props.history.push('/choose-role');
			return;
		}
		verifyAccount({hash})
			.then(() => {
				props.loadViewer();
			})
			.catch((error) => {
				if (hasErrorCode(error, 'INVALID_HASH') || hasErrorCode(error, 'EXPIRED_HASH')) {
					props.showNotification({
						view: 'error',
						text: translates.errors.invalidVerification,
						timeout: true
					});
				}
			})
			.finally(() => {
				props.history.push('/choose-role');
			});
	}

	render() {
		return null;
	}
}

const VerifyAccount = withRouter(connect(Page));

export default VerifyAccount;
