import './choose-role.css';

import React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import AppState, {RoleType} from '@/web/state/app-state';
import BackgroundMain from '@/common/views/background-main/background-main';
import LinkWrapper from '@/common/views/link-wrapper/link-wrapper';
import Card from '@/common/views/card/card';
import Avatar from '@/common/views/avatar/avatar';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import {Viewer} from '@/common/types/user';
import appActions from '@/web/actions/app-actions';
import {RouteComponentProps, withRouter} from 'react-router';
import Warning from '@/common/views/warning/warning';
import Button from '@/common/views/button/button';
import notificationActions from '@/web/actions/notification-actions';
import {requestVerification, sendMetrics} from '@/web/actions/data-provider';
import {hasErrorCode} from '@/common/core/apollo-client/errors';
import apolloClient from '@/common/core/apollo-client/apollo-client';
import {gql, ObservableSubscription} from '@apollo/client';
import {getFullnessScore} from '@/web/utils/user-utils';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';

import settingsIcon from '@/common/icons/settings.svg';

const mapDispatchToProps = {
	setRole: appActions.setRole,
	loadViewer: appActions.loadViewer,
	showNotification: notificationActions.showNotification,
	updateViewer: appActions.updateViewer
};

interface StateToProps {
	viewer: Viewer;
}

type Props = StateToProps & typeof mapDispatchToProps & I18nProps & RouteComponentProps;

const connect = ReactRedux.connect((state: AppState) => ({viewer: state.viewer}), mapDispatchToProps);

const b = classname('choose-role');

class ChooseRolePage extends React.Component<Props> {
	private _subscription?: ObservableSubscription;

	private _setRole = (role: RoleType): void => {
		const props = this.props;
		const viewer = props.viewer;
		const fromSubscribePage = localStorage.getItem('fromSubscriptionPage');
		props.setRole(role);
		const fullnessScore = getFullnessScore(viewer, 'contractor');
		const isFirstSignIn = props.viewer.modals?.isFirstSignIn;

		props.history.push('/search');
		if (fromSubscribePage) {
			localStorage.removeItem('fromSubscriptionPage');
			props.history.push('subscription');
		} else {
			if (role === 'contractor' && !isFirstSignIn && fullnessScore < 1) {
				props.history.push('/settings/specialty');
				this._updateUser();
			} else if (role === 'employer') {
				props.history.push('/projects');
			} else {
				props.history.push('/search');
			}
		}
	};

	componentDidMount() {
		const viewer = this.props.viewer;
		if (!viewer.verified) {
			this._subscribe();
		}
	}

	componentWillUnmount() {
		this._unsubscribe();
	}

	private _subscribe = (): void => {
		this._subscription = apolloClient
			.subscribe({
				query: gql`
					subscription {
						verification
					}
				`
			})
			.subscribe({
				next: () => {
					this.props.loadViewer();
					localStorage.removeItem('utms');
				}
			});
	};

	private _unsubscribe = (): void => {
		if (this._subscription) {
			this._subscription.unsubscribe();
			this._subscription = undefined;
		}
	};

	private _sendVerification = (): void => {
		const props = this.props;
		const showNotification = props.showNotification;
		requestVerification()
			.then(() => {
				showNotification({
					view: 'success',
					text: props.translates.chooseRole.verification.mailSent,
					timeout: true
				});
			})
			.catch((error) => {
				if (hasErrorCode(error, 'HAS_ACTIVE_VERIFICATION')) {
					showNotification({
						view: 'error',
						text: props.translates.chooseRole.verification.mailAlreadySent,
						timeout: true
					});
				}
			});
	};

	private _updateUser = () => {
		const viewer = this.props.viewer;
		sendMetrics({type: 'modals_isFirstSignIn', data: true}).then(() => {
			this.props.updateViewer({...viewer, modals: {...viewer.modals, isFirstSignIn: true}});
		});
	};

	private _renderViewer = (): React.ReactNode => {
		const props = this.props;
		const viewer = props.viewer;
		return (
			<div className={b('user')}>
				<Avatar user={viewer} size={96} />
				<div className={b('name')}>
					{viewer.localeFirstname}
					<div>{viewer.localeLastname}</div>
				</div>
				{viewer.verified ? (
					<LinkWrapper url="/settings">
						<div className={b('edit')}>
							<SvgIcon url={settingsIcon} width={16} height={16} />
						</div>
					</LinkWrapper>
				) : null}
			</div>
		);
	};

	private _renderRoles = (): React.ReactNode => {
		const props = this.props;
		const t = props.translates;
		const viewer = props.viewer;
		const isVerified = Boolean(viewer.verified);
		return (
			<>
				{!isVerified ? (
					<>
						<Warning warning margin>
							{t.chooseRole.verification.disclaimer}
						</Warning>
						<div className={b('send-again')} onClick={this._sendVerification}>
							<Button text={t.chooseRole.verification.sendAgain} />
						</div>
					</>
				) : null}
				<div className={b('roles')}>
					<Card
						className={b('role', {invalid: !isVerified})}
						onClick={() => this._setRole('employer')}
						rounded
						shadow
						hoverScale
					>
						<div className={b('role-continue')}>{t.chooseRole.employerContinueAs}</div>
						<div className={b('role-as')}>{t.chooseRole.employerText}</div>
						<div className={b('role-text')}>{t.chooseRole.employerDescription}</div>
					</Card>
					<Card
						className={b('role', {invalid: !isVerified})}
						onClick={() => this._setRole('contractor')}
						rounded
						shadow
						hoverScale
					>
						<div className={b('role-continue')}>{t.chooseRole.contractorContinueAs}</div>
						<div className={b('role-as')}>{t.chooseRole.contractorText}</div>
						<div className={b('role-text')}>{t.chooseRole.contractorDescription}</div>
					</Card>
				</div>
				<div className={b('signout')}>
					<Button view="invisible" text={t.logout} url="/signout" />
				</div>
			</>
		);
	};

	render() {
		const props = this.props;
		const t = props.translates;
		const viewer = this.props.viewer;
		return (
			<BackgroundMain>
				<div className={b()}>
					<div className={b('welcome')}>
						{t.chooseRole.welcome}
						<br />
						{t.chooseRole.chooseRole}
					</div>
					{viewer ? (
						<>
							{this._renderViewer()}
							{this._renderRoles()}
						</>
					) : null}
				</div>
			</BackgroundMain>
		);
	}
}

export default withRouter(connect(i18nConnect(ChooseRolePage)));
