import './contractor-invite.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import FixedSideView from '@/web/views/fixed-side-view/fixed-side-view';
import ContractorView from '@/web/views/contractor-view/contractor-view';
import {getMyProjects, getUser, inviteContractor} from '@/web/actions/data-provider';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {User} from '@/common/types/user';
import SizedItemsList from '@/common/views/sized-items-list/sized-items-list';
import Button from '@/common/views/button/button';
import PageTitle from '@/web/views/page-title/page-title';
import {Project} from '@/common/types/project';
import EmployerProjectCard from '@/web/views/employer-project-card/employer-project-card';
import notificationActions from '@/web/actions/notification-actions';
import composeConnect from '@/common/core/compose/compose';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import AppState from '@/web/state/app-state';
import {hasErrorCode} from '@/common/core/apollo-client/errors';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';

import tickIcon from '@/common/icons/tick.svg';

const mapDispatchToProps = {
	showNotification: notificationActions.showNotification
};

interface StateToProps {
	isMobileLayout?: boolean;
}

type ReduxProps = StateToProps & typeof mapDispatchToProps;

interface SelfProps {}

type Props = SelfProps & ReduxProps & RouteComponentProps<{username: string}> & I18nProps;

interface State {
	user?: User;
	projects: Project[];
	selected?: string;
	success?: boolean;
}

const connect = composeConnect<SelfProps, ReduxProps, RouteComponentProps<{username: string}>, I18nProps>(
	ReactRedux.connect((state: AppState): StateToProps => ({isMobileLayout: state.isMobileLayout}), mapDispatchToProps),
	withRouter,
	i18nConnect
);

const b = classname('contractor-invite-page');

class ContractorInvitePage extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			projects: []
		};
	}

	componentDidMount() {
		this._load();
	}

	private _load = (): void => {
		const username = this.props.match.params.username;
		getUser({username}).then((user) => {
			this.setState({user}, this._loadPortfolio);
		});
	};

	private _loadPortfolio = (): void => {
		const state = this.state;
		const user = state.user;
		if (user) {
			getMyProjects('active').then((projects) => {
				this.setState({projects});
			});
		}
	};

	private _invite = (): void => {
		const props = this.props;
		const state = this.state;
		const user = state.user;
		if (!user) {
			return;
		}
		const t = props.translates;
		const projects = state.projects;
		if (projects.length === 0) {
			props.showNotification({
				view: 'error',
				text: t.errors.noProjectsForInvite,
				timeout: true
			});
			return;
		}
		const selected = state.selected;
		if (!selected) {
			props.showNotification({
				view: 'error',
				text: t.errors.selectProjectForInvite,
				timeout: true
			});
			return;
		}

		if (user.busy) {
			props.showNotification({
				view: 'error',
				text: t.errors.selectedContractorIsBusy,
				timeout: true
			});
			return;
		}

		inviteContractor({
			contractor: user._id,
			projects: [selected]
		})
			.then((result) => {
				if (result) {
					this.setState({success: true});
				}
			})
			.catch((error) => {
				if (hasErrorCode(error, 'USER_BUSY')) {
					props.showNotification({
						view: 'error',
						text: t.errors.selectedContractorIsBusy,
						timeout: true
					});
				}
			});
	};

	private _selectProject = (project: Project): void => {
		this.setState({selected: project._id});
	};

	private _renderButtons = (): React.ReactNode => {
		const props = this.props;
		const state = this.state;
		if (state.success) {
			return null;
		}
		const t = props.translates;
		return (
			<div className={b('buttons')}>
				<Button text={t.buttons.invite} disabled={!state.selected} onClick={this._invite} />
				{props.history.length > 1 ? (
					<div className={b('back')}>
						<Button view="invisible" text={t.buttons.back} onClick={props.history.goBack} />
					</div>
				) : null}
			</div>
		);
	};

	private _renderSide = (): React.ReactNode => {
		const props = this.props;
		const state = this.state;
		const user = state.user;
		if (!user || (props.isMobileLayout && state.success)) {
			return null;
		}
		return (
			<div className={b('side')}>
				<ContractorView user={user} hideActions />
				{props.isMobileLayout ? null : this._renderButtons()}
			</div>
		);
	};

	private _renderBottom = (project: Project): React.ReactNode => {
		const selected = this.state.selected;
		if (selected !== project._id) {
			return null;
		}
		return (
			<div className={b('project-selected')}>
				<div className={b('project-selected-icon')}>
					<SvgIcon url={tickIcon} width={32} height={32} noFill stroke />
				</div>
			</div>
		);
	};

	private _renderList = (): React.ReactNode => {
		const state = this.state;
		const projects = state.projects;
		const user = state.user;
		if (!user) {
			return null;
		}
		const t = this.props.translates;
		return (
			<div className={b('list')}>
				<div className={b('list-head')}>
					<PageTitle>{t.pages.employer.contractor.invite.title}</PageTitle>
				</div>
				<SizedItemsList gutter={16}>
					{projects.map((project) => (
						<EmployerProjectCard
							project={project}
							bottom={this._renderBottom(project)}
							onClick={this._selectProject}
							key={project._id}
						/>
					))}
				</SizedItemsList>
				{projects.length === 0 ? (
					<div className={b('empty')}>
						<Button text={t.pages.employer.contractor.invite.addProject} url="/projects" />
					</div>
				) : null}
				{this.props.isMobileLayout ? this._renderButtons() : null}
			</div>
		);
	};

	private _renderSuccess = (): React.ReactNode => {
		const state = this.state;
		const user = state.user!;
		const project = state.projects.find((project) => project._id === state.selected);
		if (!user || !project) {
			return null;
		}
		const t = this.props.translates;
		return (
			<div className={b('success')}>
				<div className={b('success-title')}>{t.pages.employer.contractor.invite.success}</div>
				<div className={b('success-text')}>
					{t.pages.employer.contractor.invite.successDisclaimer.replace('%s', user.localeFullname || '')}
				</div>
				<div className={b('project-title')}>{project.localeTitle}</div>
				<div className={b('project-description')}>{project.localeDescription}</div>
				<div className={b('buttons')}>
					<Button text={t.buttons.continueSearch} url="/search" />
				</div>
			</div>
		);
	};

	render(): React.ReactNode {
		const state = this.state;
		return (
			<div className={b()}>
				<FixedSideView side={this._renderSide()}>
					{state.success ? this._renderSuccess() : this._renderList()}
				</FixedSideView>
			</div>
		);
	}
}

export default connect(ContractorInvitePage);
