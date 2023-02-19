import './notification.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import {NotificationItem, UserNotification} from '@/common/types/notification';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import asyncAction, {AsyncAction} from '@/common/core/async-action/async-action';
import NotificationTextView from './notification-text-view';

import closeIcon from '@/common/icons/close.svg';

interface Props extends NotificationItem {
	onClose: (id: string) => void;
	onClick: (item: UserNotification) => void;
}

const b = classname('notification');

class Notification extends React.Component<Props> {
	private _asyncAction?: AsyncAction;

	componentDidMount() {
		this._setTimeout();
	}

	private _onClose = (): void => {
		const props = this.props;
		asyncAction.cancel(this._asyncAction);
		props.onClose(props.id!);
	};

	private _onClick = (): void => {
		const props = this.props;
		if (props.data) {
			props.onClick(props.data);
		}
	};

	private _setTimeout = (): void => {
		const props = this.props;
		asyncAction.cancel(this._asyncAction);

		if (typeof props.timeout === 'number') {
			this._asyncAction = asyncAction.create(
				new Promise((resolve) => setTimeout(resolve, props.timeout as number)),
				{
					success: () => props.onClose(props.id!)
				}
			);
		}
	};

	render(): React.ReactNode {
		const item = this.props;
		return (
			<div className={b('wrap')}>
				<div
					className={b({
						view: item.view,
						clickable: item.close || Boolean(item.data)
					})}
					onClick={item.data ? this._onClick : undefined}
				>
					<div className={b('text')}>{item.data ? <NotificationTextView {...item.data} /> : item.text}</div>
					{item.close ? (
						<div className={b('close')} onClick={this._onClose}>
							<SvgIcon url={closeIcon} width={16} height={16} />
						</div>
					) : null}
				</div>
			</div>
		);
	}
}

export default Notification;
