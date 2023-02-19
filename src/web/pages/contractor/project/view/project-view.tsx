import './project-view.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import ProjectView from '@/web/views/project-view/project-view';
import {Project} from '@/common/types/project';
import composeConnect from '@/common/core/compose/compose';
import {RouteComponentProps, withRouter} from 'react-router';
import {getProject} from '@/web/actions/data-provider';
import FixedSideView from '@/web/views/fixed-side-view/fixed-side-view';
import Button from '@/common/views/button/button';
import Warning from '@/common/views/warning/warning';
import Avatar from '@/common/views/avatar/avatar';
import LinkWrapper from '@/common/views/link-wrapper/link-wrapper';
import {Viewer} from '@/common/types/user';
import AppState from '@/web/state/app-state';
import ConditionalRender from '@/common/views/conditional-render/conditional-render';
import Dialog from '@/common/views/dialog/dialog';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';

interface SelfProps {}

interface ReduxProps {
	viewer?: Viewer;
}

type Props = SelfProps & ReduxProps & RouteComponentProps<{id: string}> & I18nProps;

interface State {
	project?: Project;
	showAdviceDialog: boolean;
}

const connect = composeConnect<SelfProps, ReduxProps, RouteComponentProps, I18nProps>(
	ReactRedux.connect(
		(state: AppState): ReduxProps => ({
			viewer: state.viewer
		})
	),
	withRouter,
	i18nConnect
);

const b = classname('contractor-project-view-page');

class ProjectViewPage extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			showAdviceDialog: false
		};
	}

	componentDidMount() {
		this._loadProject();
		const props = this.props;
		const viewer = props?.viewer;
		const subscriptionLevel = viewer?.subscription?.level;
		const isStartLevel = subscriptionLevel && subscriptionLevel === 'start';
		if (isStartLevel) {
			this.setState({showAdviceDialog: true});
		}
	}

	private _loadProject = (): void => {
		const props = this.props;
		const id = props.match.params.id;
		if (id) {
			getProject(id).then((project) => {
				this.setState({project});
			});
		} else {
			props.history.push('/search');
		}
	};

	private _onAuthorClick = (): void => {
		this.props.history.push(`/profile/${this.state.project!.author.username}`);
	};

	private _renderProjectContacts = (): React.ReactNode => {
		if (!this.props.viewer) {
			return null;
		}

		const project = this.state.project!;
		const isAccepted = project.application?.status === 'accepted';
		const author = project.author;
		const website = author.website || '';
		const url =
			website && !website.startsWith('http://') && !website.startsWith('https://')
				? 'https://' + website
				: website;
		const t = this.props.translates;
		return (
			<>
				{project.status === 'archived' ? <Warning margin>{t.projectFinished}</Warning> : null}
				{isAccepted ? (
					<Warning success margin>
						{t.notifications.youAreContractor}
					</Warning>
				) : null}
				{author.email ? (
					<div className={b('author-info')}>
						<div className={b('author-avatar')} onClick={this._onAuthorClick}>
							<Avatar user={author} />
						</div>
						<div className={b('author-name')} onClick={this._onAuthorClick}>
							<div>{author.localeFirstname}</div>
							<div>{author.localeLastname}</div>
						</div>
						<div className={b('author-contacts')}>
							<div>{author.email}</div>
							<div>{author.phone}</div>
							<div>
								<LinkWrapper url={url} link>
									{website}
								</LinkWrapper>
							</div>
						</div>
					</div>
				) : null}
			</>
		);
	};

	private _renderProject = (): React.ReactNode => {
		const props = this.props;
		const project = this.state.project;
		if (!project) {
			return null;
		}
		const id = props.match.params.id;
		const est = project.applicationEst || 0;
		const t = props.translates;
		return (
			<>
				<ProjectView project={project} />
				{this._renderProjectContacts()}
				<div className={b('buttons')}>
					{props.viewer ? (
						<Button
							view="secondary"
							text={t.buttons.back}
							url={props.history.length === 0 ? '/search' : undefined}
							onClick={props.history.length > 1 ? props.history.goBack : undefined}
						/>
					) : null}
					{!project.endDate || est > 0 ? (
						<Button
							text={t.buttons.apply}
							disabled={Boolean(project.application || project.status === 'archived')}
							url={`/project/${id}/apply`}
						/>
					) : null}
				</div>
			</>
		);
	};

	private _renderList = (): React.ReactNode => {
		if (this.props.viewer) {
			return null;
		}

		const t = this.props.translates;
		return (
			<div className={b('prompt')}>
				<div className={b('prompt-text')}>{t.notifications.needAuth}</div>
				<div>
					<Button url="/signin" text={t.buttons.enter} />
					<Button url="/signup" text={t.buttons.signup} />
				</div>
			</div>
		);
	};

	private _renderAdvice = (): React.ReactNode => {
		const t = this.props.translates;
		return (
			<Dialog
				isOpen={this.state.showAdviceDialog}
				showClose={true}
				onClose={() => this.setState({showAdviceDialog: false})}
				overlayClose
			>
				<div className={b('congratulation__wrapper')}>
					<div className={b('congratulation__title')}>
						{t.pages.contractor.project.view.congratulations.title}
					</div>
					<div className={b('congratulation__subtitle')}>
						{t.pages.contractor.project.view.congratulations.subtitle[0]}
					</div>
					<div className={b('congratulation__subtitle')}>
						{t.pages.contractor.project.view.congratulations.subtitle[1]}
					</div>
					<Button
						className={b('congratulation__button')}
						text={t.buttons.changePlan}
						onClick={() => this.props.history.push('/subscription')}
					/>
				</div>
			</Dialog>
		);
	};

	private _renderView = (noMargin: boolean): React.ReactNode => {
		return (
			<FixedSideView width={580} side={this._renderProject()} noMargin={noMargin}>
				{this._renderList()}
				{this._renderAdvice()}
			</FixedSideView>
		);
	};

	render(): React.ReactNode {
		return (
			<div className={b()}>
				<ConditionalRender if={isNotLogged} else={this._renderView(false)} children={this._renderView(true)} />
			</div>
		);
	}
}

function isNotLogged(state: AppState) {
	return !state.viewer;
}

export default connect(ProjectViewPage);
