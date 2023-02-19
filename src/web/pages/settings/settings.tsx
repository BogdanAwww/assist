import './settings.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import composeConnect from '@/common/core/compose/compose';
import FixedSideView from '@/web/views/fixed-side-view/fixed-side-view';
import PageTitle from '@/web/views/page-title/page-title';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import {Switch, Route, RouteProps, withRouter, RouteComponentProps} from 'react-router';
import PasswordPage from './password/password';
import CommonPage from './common/common';
import ContactsPage from './contacts/contacts';
import SpecialtyPage from './specialty/specialty';
import {Viewer} from '@/common/types/user';
import AppState, {RoleType} from '@/web/state/app-state';
import Warning from '@/common/views/warning/warning';
import config from '@/web/config';
import Button from '@/common/views/button/button';
import SubscriptionBadge from '@/common/views/subscription-badge/subscription-badge';
import Hint from '@/common/views/hint/hint';
import IconInfo from '@/common/views/icon-info/icon-info';
import {getFullnessScore, validateViewerWithSchema, getSchemaByRole} from '@/web/utils/user-utils';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';

import levelsIcon from '@/common/icons/levels.svg';
import keyIcon from '@/common/icons/key.svg';
import userIcon from '@/common/icons/user.svg';
import letterIcon from '@/common/icons/letter.svg';
import logoutIcon from '@/common/icons/logout.svg';
import premiumIcon from '@/common/icons/premium.svg';
import portfolioIcon from '@/common/icons/briefcase.svg';

interface Option {
	title: string;
	icon: string;
	url: string;
	additional?: React.ReactNode;
}

const routes: RouteProps[] = [
	{
		path: '/settings/common',
		component: CommonPage
	},
	{
		path: '/settings/specialty',
		component: SpecialtyPage
	},
	{
		path: '/settings/contacts',
		component: ContactsPage
	},
	{
		path: '/settings/password',
		component: PasswordPage
	}
];

interface StateToProps {
	viewer: Viewer;
	role?: RoleType;
	isMobileLayout?: boolean;
}

type Props = StateToProps & RouteComponentProps & I18nProps;

interface State {
	showSettings?: boolean;
}

const connect = composeConnect<{}, StateToProps, RouteComponentProps, I18nProps>(
	ReactRedux.connect(
		(state: AppState): StateToProps => ({
			viewer: state.viewer!,
			role: state.role,
			isMobileLayout: state.isMobileLayout
		})
	),
	withRouter,
	i18nConnect
);

const b = classname('settings-page');

class SettingsPage extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			showSettings: props.history.location.pathname.startsWith('/settings/')
		};
	}

	componentDidUpdate(props: Props) {
		const showSettings = props.history.location.pathname.startsWith('/settings/');
		if (this.state.showSettings !== showSettings) {
			this.setState({showSettings});
		}
	}

	private _onOptionClick = (option: Option): void => {
		this.props.history.push(option.url);
	};

	private _renderOption = (option: Option): React.ReactNode => {
		const props = this.props;
		const selected = props.history.location.pathname === option.url;
		return (
			<div className={b('option', {selected})} onClick={() => this._onOptionClick(option)}>
				<div className={b('option-icon')}>
					<SvgIcon url={option.icon} width={20} height={20} />
				</div>
				<div className={b('option-title')}>{option.title}</div>
				<div className={b('option-right')}>{option.additional}</div>
			</div>
		);
	};

	private _renderSide = (): React.ReactNode => {
		const props = this.props;
		const t = props.translates;
		if (props.isMobileLayout && this.state.showSettings) {
			return null;
		}
		const viewer = props.viewer;
		const profileLink = window.location.origin + config.baseUrl + 'profile/' + viewer.username;
		const fullnessScore = getFullnessScore(viewer, props.role);

		const SIGNOUT_OPTION = {
			url: '/signout',
			title: t['exit'],
			icon: logoutIcon
		};
		return (
			<div className={b('side')}>
				<PageTitle>{t['settings']}</PageTitle>
				<Warning warning={fullnessScore < 1} success={fullnessScore === 1} margin>
					<div className={b('fullness', {success: fullnessScore === 1})}>
						<div style={{width: Math.floor(fullnessScore * 100) + '%'}} />
					</div>
					{t.settingsFullness?.[0]} {Math.floor(fullnessScore * 100)}%.
					{fullnessScore < 1 ? <div>{t.settingsFullness?.[1]}</div> : null}
					{fullnessScore === 1 ? <span>{t.settingsFullness?.[2]}</span> : null}
				</Warning>
				<div className={b('options')}>
					{this._renderOption({
						url: '/settings/common',
						title: t.pages.settings.menu.common,
						icon: levelsIcon,
						additional: !validateViewerWithSchema(viewer, getSchemaByRole('COMMON', props.role)) ? (
							<Hint position="right" content={t['settingsHint']}>
								<IconInfo margin error />
							</Hint>
						) : null
					})}
					{this._renderOption({
						url: '/settings/specialty',
						title: t.pages.settings.menu.specialties,
						icon: userIcon,
						additional: !validateViewerWithSchema(viewer, getSchemaByRole('SPECIALTY', props.role)) ? (
							<Hint position="right" content={t['settingsHint']}>
								<IconInfo margin error />
							</Hint>
						) : null
					})}
					{this._renderOption({
						url: '/settings/contacts',
						title: t.pages.settings.menu.contacts,
						icon: letterIcon
					})}
					{this._renderOption({
						url: '/settings/password',
						title: t.pages.settings.menu.password,
						icon: keyIcon
					})}
					{this._renderOption({
						url: '/subscription',
						title: t.pages.settings.menu.subscription,
						icon: premiumIcon,
						additional: <SubscriptionBadge user={this.props.viewer} />
					})}
					{this._renderOption({
						url: '/portfolio',
						title: t.pages.settings.menu.portfolio,
						icon: portfolioIcon,
						additional:
							props.role === 'contractor' && !props.viewer.hasPortfolio ? (
								<Hint position="right" content={t['subscriptionHint']}>
									<IconInfo margin error />
								</Hint>
							) : null
					})}
				</div>
				<Warning margin>
					<div>
						{t['your']} ID: {viewer.username}
					</div>
					<div>
						{t['profileLink']}:{' '}
						<a className={b('link')} href={profileLink}>
							{profileLink}
						</a>
					</div>
				</Warning>
				{this._renderOption(SIGNOUT_OPTION)}
			</div>
		);
	};

	private _renderContent = (): React.ReactNode => {
		const props = this.props;
		const t = props.translates;
		if (props.isMobileLayout && !this.state.showSettings) {
			return null;
		}
		return (
			<>
				<Switch>
					{routes.map((routeProps, index) => (
						<Route {...routeProps} key={index} />
					))}
					<Route path="*">
						<Warning margin info size="medium">
							{t.settingsContent?.[0]}
							<br />
							{t.settingsContent?.[1]}
						</Warning>
					</Route>
				</Switch>
				{props.isMobileLayout ? (
					<div className={b('back')}>
						<Button view="invisible" text={t['back']} url="/settings" />
					</div>
				) : null}
			</>
		);
	};

	render(): React.ReactNode {
		return (
			<FixedSideView side={this._renderSide()} noMargin>
				{this._renderContent()}
			</FixedSideView>
		);
	}
}

export default connect(SettingsPage);
