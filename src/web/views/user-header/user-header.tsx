import './user-header.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import Header from '@/common/views/header/header';
import Button from '@/common/views/button/button';
import TextSwitch, {SwitchItem} from '@/common/views/text-switch/text-switch';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import {RouteComponentProps, withRouter} from 'react-router';
import LinkWrapper from '@/common/views/link-wrapper/link-wrapper';
import AppState, {RoleType} from '@/web/state/app-state';
import composeConnect from '@/common/core/compose/compose';
import NotificationsPopup from '@/common/views/notification/notifications-popup';
import Dialog from '@/common/views/dialog/dialog';
import Hint from '@/common/views/hint/hint';
import appActions from '@/web/actions/app-actions';
import customEventConnect, {CustomEventProps} from '@/common/utils/custom-event-connect';
import PageTitle from '../page-title/page-title';
import Highlighter from '@/common/views/highlighter/highlighter';
import {Viewer} from '@/common/types/user';
import {isValidViewer} from '@/web/utils/user-utils';
import {TranslatesContext} from '@/common/views/translates-provider/translates-provider';

import zoomIcon from '@/common/icons/zoom.svg';
import bookmarkIcon from '@/common/icons/bookmark.svg';
import notificationIcon from '@/common/icons/notification.svg';
import settingsIcon from '@/common/icons/settings.svg';
import closeIcon from '@/common/icons/close-circle.svg';
import menuIcon from '@/common/icons/menu.svg';
import questionIcon from '@/common/icons/question.svg';
import messageIcon from '@/common/icons/message.svg';
import chatActions from '@/web/actions/chat-actions';

const mapDispatchToProps = {
	setRole: appActions.setRole,
	showChat: chatActions.showSidebar
};

interface StateToProps {
	viewer?: Viewer;
	unreadCount?: number;
	chatUnreadCount: number;
	role?: RoleType;
	isMobileLayout?: boolean;
}

type ReduxProps = StateToProps & typeof mapDispatchToProps;

interface SelfProps {
	hideRole?: boolean;
	hideRoleButtons?: boolean;
	closeBackUrl?: string;
}

type Props = SelfProps & ReduxProps & RouteComponentProps & CustomEventProps;

interface State {
	showMenu?: boolean;
	showSupport?: boolean;
}

const connect = composeConnect<SelfProps, ReduxProps, RouteComponentProps, CustomEventProps>(
	ReactRedux.connect(
		(state: AppState): StateToProps => ({
			viewer: state.viewer,
			role: state.role,
			unreadCount: state.notifications.data?.count.unread,
			chatUnreadCount: state.chat.unread,
			isMobileLayout: state.isMobileLayout
		}),
		mapDispatchToProps
	),
	withRouter,
	customEventConnect
);

const b = classname('user-header');

class UserHeader extends React.Component<Props, State> {
	static contextType = TranslatesContext;

	constructor(props: Props) {
		super(props);

		this.state = {};
	}

	private _onRoleChange = (role: RoleType): void => {
		const props = this.props;
		props.setRole(role);
		this.setState({showMenu: false});
		if (role === 'employer') {
			props.history.push('/projects');
		} else {
			props.history.push('/search');
		}
	};

	private _onCloseClick = (): void => {
		const props = this.props;
		if (props.closeBackUrl) {
			if (!props.role && isValidViewer(props.viewer)) {
				props.setRole('contractor', true);
			}
			props.history.push(props.closeBackUrl);
		}
	};

	private _onSearchClick = (): void => {
		this.props.events.emit('search');
	};

	private _onCloseSupportHint = (): void => {
		localStorage.setItem('hint-support', '1');
	};

	private _renderRoleSelector = (role: string): React.ReactNode => {
		const t = this.context.translates;
		const TEXT_SWITCH_VALUES: SwitchItem[] = [
			{title: t['header_contractor'], key: 'contractor'},
			{title: t['header_employer'], key: 'employer'}
		];

		return (
			<Hint position="bottom" content={t['header_hint']}>
				<div className={b('role-switch')}>
					<TextSwitch items={TEXT_SWITCH_VALUES} selected={role} onChange={this._onRoleChange} />
				</div>
			</Hint>
		);
	};

	private _renderChatButton = (): React.ReactNode => {
		const props = this.props;
		return (
			<div className={b('icon-button', {chat: true})} onClick={props.showChat}>
				<div className={b('chat')}>
					<SvgIcon url={messageIcon} width={18} height={18} />
					{props.chatUnreadCount > 0 ? (
						<div className={b('chat-unread')}>
							{props.chatUnreadCount > 99 ? '99' : props.chatUnreadCount}
						</div>
					) : null}
				</div>
			</div>
		);
	};

	private _renderButtons = (role?: string): React.ReactNode => {
		const props = this.props;
		const t = this.context.translates;
		const isMobileLayout = props.isMobileLayout;
		if (!role || props.hideRole) {
			return null;
		}
		return (
			<div className={b('icons')}>
				<LinkWrapper className={b('icon-button')} url="/favorites">
					<div className={b('icon-button')}>
						<SvgIcon url={bookmarkIcon} width={20} height={20} />
					</div>
				</LinkWrapper>
				<NotificationsPopup>
					{({getRef, onClick}) => (
						<div className={b('icon-button', {notification: true})} ref={getRef} onClick={onClick}>
							<SvgIcon url={notificationIcon} width={20} height={20} />
							<div className={b('notification-count')}>{props.unreadCount || undefined}</div>
						</div>
					)}
				</NotificationsPopup>
				<Highlighter
					show={Boolean(!localStorage.getItem('hint-support'))}
					title={t.hint}
					content={t.headerSupportHintText}
					onClose={this._onCloseSupportHint}
				>
					<div className={b('icon-button')} onClick={() => this.setState({showSupport: true})}>
						<SvgIcon url={questionIcon} width={20} height={20} />
					</div>
				</Highlighter>
				{isMobileLayout ? (
					<>
						{this._renderChatButton()}
						<div className={b('icon-button')} onClick={() => this.setState({showMenu: true})}>
							<SvgIcon url={menuIcon} width={20} height={20} />
						</div>
					</>
				) : (
					<>
						<LinkWrapper className={b('icon-button')} url="/settings">
							<div className={b('icon-button')}>
								<SvgIcon url={settingsIcon} width={20} height={20} />
							</div>
						</LinkWrapper>
						{this._renderChatButton()}
					</>
				)}
			</div>
		);
	};

	private _renderEmployerButtons = (): React.ReactNode => {
		const props = this.props;
		const t = this.context.translates;
		return (
			<div className={b('main-buttons')}>
				<Button
					className={b('button')}
					view="bordered"
					text={t['myProjects']}
					url="/projects"
					stretched={props.isMobileLayout}
				/>
				<Hint position="right" content={t['header_buttonHint']}>
					<Button
						className={b('button')}
						view="primary"
						text={t['findContractor']}
						icon={<SvgIcon url={zoomIcon} width={16} height={16} />}
						url="/search"
						onClick={this._onSearchClick}
						stretched={props.isMobileLayout}
					/>
				</Hint>
			</div>
		);
	};

	private _renderContractorButtons = (): React.ReactNode => {
		const props = this.props;
		const t = this.context.translates;
		return (
			<div className={b('main-buttons')}>
				<Button
					className={b('button')}
					view="primary"
					text={t['findProject']}
					icon={<SvgIcon url={zoomIcon} width={16} height={16} />}
					url="/search"
					onClick={this._onSearchClick}
					stretched={props.isMobileLayout}
				/>
				<Button
					className={b('button')}
					view="bordered"
					text={t['myApplications']}
					url="/applications"
					stretched={props.isMobileLayout}
				/>
			</div>
		);
	};

	private _renderRoleButtons = (type?: string): React.ReactNode => {
		if (!type || this.props.hideRoleButtons) {
			return null;
		}
		if (type === 'employer') {
			return this._renderEmployerButtons();
		}
		return this._renderContractorButtons();
	};

	private _renderDesktopRoleLayout = (type?: string): React.ReactNode => {
		const props = this.props;
		if (!type || props.hideRole) {
			return null;
		}
		return (
			<>
				{this._renderRoleButtons(type)}
				{this._renderRoleSelector(type)}
				{this._renderButtons(type)}
			</>
		);
	};

	private _renderClose = (): React.ReactNode => {
		const props = this.props;
		if (!props.hideRole && props.role) {
			return null;
		}
		return (
			<div className={b('close')} onClick={this._onCloseClick}>
				<SvgIcon url={closeIcon} width={24} height={24} />
			</div>
		);
	};

	private _renderMobileMenu = (): React.ReactNode => {
		const props = this.props;
		const state = this.state;
		const isContractor = props.role === 'contractor';
		const t = this.context.translates;
		return (
			<Dialog
				isOpen={state.showMenu}
				className={b('menu')}
				onClose={() => this.setState({showMenu: false})}
				overlayClose
				noPadding
			>
				<div className={b('menu-content')}>
					{props.hideRoleButtons ? (
						<div className={b('menu-item')} onClick={() => props.history.push('/search')}>
							{t['search']}
						</div>
					) : null}
					<div className={b('menu-item')} onClick={() => props.history.push('/portfolio')}>
						{t['portfolio']}
					</div>
					<div
						className={b('menu-item')}
						onClick={() => this._onRoleChange(isContractor ? 'employer' : 'contractor')}
					>
						{isContractor ? t['employer'] : t['contractor']}
					</div>
					<div className={b('menu-item')} onClick={() => props.history.push('/settings')}>
						{t['settings']}
					</div>
					<div className={b('menu-item')} onClick={() => props.history.push('/signout')}>
						{t['exit']}
					</div>
				</div>
			</Dialog>
		);
	};

	private _renderSupport = (): React.ReactNode => {
		const t = this.context.translates;
		return (
			<Dialog
				isOpen={this.state.showSupport}
				className={b('support')}
				onClose={() => this.setState({showSupport: false})}
				overlayClose
				showClose
			>
				<PageTitle>{t.supportDialog?.[0]}</PageTitle>
				<div className={b('support-content')}>
					{t.supportDialog?.[1]}{' '}
					<a className={b('link')} href="https://t.me/assist_support_bot" target="_blank" rel="noreferrer">
						{t.supportDialog?.[2]}
					</a>{' '}
					{t.supportDialog?.[3]}{' '}
					<a className={b('link')} href="mailto:support@assist.video" target="_blank" rel="noreferrer">
						{t.supportDialog?.[4]}
					</a>
					.
				</div>
			</Dialog>
		);
	};

	render() {
		const props = this.props;
		const role = props.role;
		const logoUrl = props.viewer
			? !props.role || props.role === 'contractor'
				? '/search'
				: '/projects'
			: '/signin';
		return (
			<div className={b()}>
				<Header smallLogo={Boolean(role)} logoUrl={logoUrl}>
					{props.isMobileLayout ? this._renderButtons(role) : this._renderDesktopRoleLayout(role)}
					{props.closeBackUrl ? this._renderClose() : null}
				</Header>
				{props.isMobileLayout && !props.hideRole ? this._renderRoleButtons(role) : null}
				{props.isMobileLayout ? this._renderMobileMenu() : null}
				{this._renderSupport()}
			</div>
		);
	}
}

export default connect(UserHeader);
