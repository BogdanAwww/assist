import './notifications.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import AppState from '@/web/state/app-state';
import {NotificationItem} from '@/common/types/notification';
import Notification from './notification';
import composeConnect from '@/common/core/compose/compose';
import {RouteComponentProps, withRouter} from 'react-router';
import notificationActions from '@/web/actions/notification-actions';

const mapDispatchToProps = {
	hideNotification: notificationActions.hideNotification,
	action: notificationActions.action
};

interface StateToProps {
	notifications: NotificationItem[];
}

interface SelfProps {}

type ReduxProps = StateToProps & typeof mapDispatchToProps;

type Props = SelfProps & ReduxProps & RouteComponentProps;

const connect = composeConnect<SelfProps, ReduxProps, RouteComponentProps>(
	ReactRedux.connect(
		(state: AppState): StateToProps => ({
			notifications: state.notifications.list
		}),
		mapDispatchToProps
	),
	withRouter
);

const b = classname('notifications');

class Notifications extends React.Component<Props> {
	private _onClose = (id: string): void => {
		this.props.hideNotification(id);
	};

	render(): React.ReactNode {
		const props = this.props;
		return (
			<div className={b()}>
				{props.notifications.map((item) => (
					<Notification {...item} onClick={props.action} onClose={this._onClose} key={item.id} />
				))}
			</div>
		);
	}
}

export default connect(Notifications);
