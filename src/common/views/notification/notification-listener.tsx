import * as React from 'react';
import * as ReactRedux from 'react-redux';
import notificationActions from '@/web/actions/notification-actions';
import {getId} from '@/common/utils/notification-utils';
import {NotificationType} from '@/common/types/notification';

const mapDispatchToProps = {
	showNotification: notificationActions.showNotification,
	hideNotification: notificationActions.hideNotification
};

type ReduxProps = typeof mapDispatchToProps;

interface SelfProps {
	text?: string;
	close?: boolean;
	timeout?: number | boolean;
	view?: NotificationType;
}

type Props = SelfProps & ReduxProps;

const connect = ReactRedux.connect(null, mapDispatchToProps);

class NotificatinoListener extends React.Component<Props> {
	private _id?: string;

	componentDidMount() {
		this._addNotification();
	}

	componentDidUpdate(prevProps: Props) {
		const props = this.props;
		if (!prevProps.text && props.text) {
			this._addNotification();
		}
		if (prevProps.text && !props.text) {
			this._removeNotification();
		}
	}

	componentWillUnmount() {
		this._removeNotification();
	}

	private _addNotification = (): void => {
		const props = this.props;
		if (props.text) {
			this._id = getId();
			props.showNotification({
				id: this._id,
				text: props.text,
				view: props.view,
				close: props.close,
				timeout: props.timeout
			});
		}
	};

	private _removeNotification = (): void => {
		const props = this.props;
		if (this._id && !props.text) {
			props.hideNotification(this._id);
			this._id = undefined;
		}
	};

	render(): React.ReactNode {
		return null;
	}
}

export default connect(NotificatinoListener);
