import './notifications-popup.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import Dialog from '../dialog/dialog';
import {UserNotification} from '@/common/types/notification';
import AppState from '@/web/state/app-state';
import NotificationTextView from './notification-text-view';
import composeConnect from '@/common/core/compose/compose';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import appActions from '@/web/actions/app-actions';
// import LinkWrapper from '@/common/views/link-wrapper/link-wrapper';
import notificationActions from '@/web/actions/notification-actions';
import {TranslatesContext} from '@/common/views/translates-provider/translates-provider';

const mapDispatchToProps = {
	seenNotifications: appActions.seenNotifications,
	action: notificationActions.action
};

interface StateToProps {
	items: UserNotification[];
	total: number;
}

type ReduxProps = StateToProps & typeof mapDispatchToProps;

interface ChildrenProps {
	getRef: React.RefObject<HTMLDivElement>;
	onClick: () => void;
}

interface SelfProps {
	children: (props: ChildrenProps) => React.ReactNode;
}

type Props = SelfProps & ReduxProps & RouteComponentProps;

interface State {
	isOpen?: boolean;
	right: number;
	top: number;
	items: UserNotification[];
}

const connect = composeConnect<SelfProps, ReduxProps, RouteComponentProps>(
	ReactRedux.connect(
		(state: AppState): StateToProps => ({
			items: state.notifications.data?.items || [],
			total: state.notifications.data?.pageInfo.itemCount || 0
		}),
		mapDispatchToProps
	),
	withRouter
);

const SHOWN_LIMIT = 10;

const b = classname('notifications-popup');

class NotificationsPopup extends React.PureComponent<Props, State> {
	private _ref = React.createRef<HTMLDivElement>();
	static contextType = TranslatesContext;

	constructor(props: Props) {
		super(props);

		this.state = {
			top: 0,
			right: 0,
			items: props.items
		};
	}

	componentDidUpdate(_props: Props, state: State) {
		if (!state.isOpen && this.state.isOpen) {
			this.setState({items: this.props.items}, this._markSeen);
			this._updatePosition();
		}
	}

	private _onClick = (item: UserNotification): void => {
		const props = this.props;
		props.action(item);
		this.setState({isOpen: false});
	};

	private _toggle = (): void => {
		this.setState({isOpen: !this.state.isOpen});
	};

	private _updatePosition = (): void => {
		const element = this._ref.current;
		if (element) {
			const rect = element.getBoundingClientRect();
			this.setState({
				right: window.innerWidth - rect.right,
				top: rect.bottom
			});
		}
	};

	private _getUnread = (): UserNotification[] => {
		return this._getLast().filter((item) => item.isUnread);
	};

	private _getLast = (): UserNotification[] => {
		return this.state.items.slice(0, SHOWN_LIMIT);
	};

	private _markSeen = (): void => {
		const ids = this._getUnread().map((item) => item._id);
		if (ids.length > 0) {
			this.props.seenNotifications(ids);
		}
	};

	private _renderNotification = (item: UserNotification): React.ReactNode => {
		return (
			<div className={b('notification')} onClick={() => this._onClick(item)} key={item._id}>
				<NotificationTextView {...item} />
			</div>
		);
	};

	private _renderContent = (): React.ReactNode => {
		const items = this._getLast();
		const t = this.context.translates;
		// const showMore = this.props.total > items.length;
		return (
			<div className={b('content')}>
				<div className={b('title')}>{t['latestNotifications']}</div>
				{items.map(this._renderNotification)}
				{items.length === 0 ? <div className={b('empty')}>{t['notificationsListEmpty']}</div> : null}
				{/* {showMore && false ? (
					<div className={b('more')}>
						<LinkWrapper className={b('more-link')} url="/notifications">
							Открыть все уведомления
						</LinkWrapper>
					</div>
				) : null} */}
			</div>
		);
	};

	render() {
		const props = this.props;
		const state = this.state;
		return (
			<>
				<Dialog
					className={b()}
					style={{top: state.top, right: state.right}}
					isOpen={state.isOpen}
					onClose={() => this.setState({isOpen: false})}
					overlayClose
					noPadding
				>
					{this._renderContent()}
				</Dialog>
				{props.children({
					getRef: this._ref,
					onClick: this._toggle
				})}
			</>
		);
	}
}

export default connect(NotificationsPopup);
