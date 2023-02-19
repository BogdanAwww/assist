import './project-view.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import FixedSideView from '@/web/views/fixed-side-view/fixed-side-view';
import ProjectView from '@/web/views/project-view/project-view';
import {
	Project,
	ProjectApplication,
	ProjectApplicationsCounter,
	ProjectApplicationsFilter
} from '@/common/types/project';
import {
	approveApplication,
	getProject,
	getProjectApplications,
	makeSeenApplication,
	projectArchive,
	projectBoost,
	projectDelete,
	rejectApplication,
	sendTest,
	getProjectApplication,
	getPossibleContractors,
	publishProject
} from '@/web/actions/data-provider';
import composeConnect from '@/common/core/compose/compose';
import {RouteComponentProps, withRouter} from 'react-router';
import SizedItemsList from '@/common/views/sized-items-list/sized-items-list';
import ContractorCard from '@/web/views/contractor-card/contractor-card';
import {PaginationInfo} from '@/common/types';
import PageTitle from '@/web/views/page-title/page-title';
import CountFilters from '@/web/views/count-filters/count-filters';
import Avatar from '@/common/views/avatar/avatar';
import Button from '@/common/views/button/button';
import Dialog from '@/common/views/dialog/dialog';
import {isEqual} from 'lodash-es';
import notificationActions from '@/web/actions/notification-actions';
import Warning from '@/common/views/warning/warning';
import LinkWrapper from '@/common/views/link-wrapper/link-wrapper';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import Hint from '@/common/views/hint/hint';
import {hasErrorCode} from '@/common/core/apollo-client/errors';
import appActions from '@/web/actions/app-actions';
import {updateSearch, parseSearch} from '@/common/utils/search-utils';
import {getApplicationsCounterFiltersValue, getApplicationsFilter} from '@/web/utils/project-utils';
import chatActions from '@/web/actions/chat-actions';
import {User, Viewer} from '@/common/types/user';
import AppState from '@/web/state/app-state';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';

import editIcon from '@/common/icons/edit.svg';
import deleteIcon from '@/common/icons/delete.svg';
import checkIcon from '@/common/icons/check.svg';
import fireIcon from '@/common/icons/fire.svg';
import {getLocalePrice} from '@/web/utils/price-utils';

const mapDispatchToProps = {
	loadViewer: appActions.loadViewer,
	showNotification: notificationActions.showNotification,
	openUserChat: chatActions.openUserChat
};

interface StateToProps {
	viewer?: Viewer;
}

type ReduxProps = StateToProps & typeof mapDispatchToProps;

interface SelfProps {}

type Props = SelfProps & ReduxProps & RouteComponentProps<{id: string}> & I18nProps;

interface State {
	project?: Project;
	applications?: ProjectApplication[];
	count?: ProjectApplicationsCounter;
	filter?: ProjectApplicationsFilter;
	pageInfo?: PaginationInfo;
	application?: ProjectApplication;
	showRejectDialog?: boolean;
	showApproveDialog?: boolean;
	showArchiveDialog?: boolean;
	showDeleteDialog?: boolean;
	showPublishDialog?: boolean;
	showCongratulationDialog?: boolean;
	recommendedContractors?: User[];
}

const connect = composeConnect<SelfProps, ReduxProps, RouteComponentProps<{id: string}>, I18nProps>(
	ReactRedux.connect((state: AppState): StateToProps => ({viewer: state.viewer}), mapDispatchToProps),
	withRouter,
	i18nConnect
);

const COUNT_OPTIONS = ['unread', 'test', 'seen', 'accepted', 'invites'];

const b = classname('employer-project-view-page');

class ProjectViewPage extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			showCongratulationDialog: false
		};
	}

	componentDidMount() {
		this._loadProject();
		const params = parseSearch();
		if (params.id) {
			getProjectApplication({id: params.id}).then((application) => {
				if (application) {
					this._openApplication(application);
				}
			});
		}
	}

	componentDidUpdate(_props: Props, state: State) {
		if (!isEqual(state.filter, this.state.filter)) {
			this._loadApplications();
		}
	}

	private _loadProject = (): void => {
		const props = this.props;
		const id = props.match.params.id;
		getProject(id).then((project) => {
			if (project && project.author._id === props.viewer?._id) {
				this.setState(
					{
						project,
						filter: {
							project: project._id,
							isUnread: true,
							status: 'active'
						}
					},
					this._loadApplications
				);
			} else {
				props.history.push('/projects');
			}
		});
		this._loadRecommendedContractors(id);
	};

	private _loadApplications = (): void => {
		const state = this.state;
		const filter = state.filter;
		if (!filter || state.project?.status === 'draft') {
			return;
		}
		getProjectApplications({filter}).then((data) => {
			if (data) {
				this.setState({
					applications: data.items,
					count: data.count,
					pageInfo: data.pageInfo
				});
			}
		});
	};

	private _loadRecommendedContractors = (projectId: string): void => {
		getPossibleContractors({projectId}).then((users) => {
			if (users) {
				this.setState({recommendedContractors: users});
			}
		});
	};

	private _openApplication = (application: ProjectApplication): void => {
		makeSeenApplication({id: application._id});
		updateSearch({id: application._id}, this.props.history);
		this.setState({application});
	};

	private _backToList = (): void => {
		updateSearch({}, this.props.history);
		this.setState({application: undefined});
		this._loadApplications();
	};

	private _showRejectDialog = (): void => {
		this.setState({showRejectDialog: true});
	};

	private _showApproveDialog = (): void => {
		this.setState({showApproveDialog: true});
	};

	private _publish = (): void => {
		const project = this.state.project;
		if (!project) {
			return;
		}
		publishProject({id: project._id})
			.then(() => {
				this._loadProject();
			})
			.finally(() => {
				this.setState({showPublishDialog: false});
			});
	};

	private _archive = (): void => {
		const project = this.state.project;
		if (!project) {
			return;
		}
		projectArchive({id: project._id})
			.then(() => {
				this._loadProject();
			})
			.finally(() => {
				this.setState({showArchiveDialog: false});
			});
	};

	private _delete = (): void => {
		const project = this.state.project;
		if (!project) {
			return;
		}
		projectDelete({id: project._id})
			.then(() => {
				this.props.history.push('/projects');
			})
			.finally(() => {
				this.setState({showArchiveDialog: false});
			});
	};

	private _reject = (): void => {
		const application = this.state.application!;
		rejectApplication({id: application._id}).then(() => {
			this.setState({application: undefined});
			this._loadApplications();
		});
	};

	private _approve = (): void => {
		const application = this.state.application!;
		approveApplication({id: application._id}).then(() => {
			this.setState({application: undefined});
			this.setState({showCongratulationDialog: true});
			this._loadApplications();
			this.props.showNotification({
				view: 'success',
				text: this.props.translates.notifications.contractorApproved,
				timeout: true
			});
		});
	};

	private _setFilter = (type: string): void => {
		const filter = this.state.filter!;
		this.setState({
			filter: getApplicationsFilter(filter, type)
		});
	};

	private _sendTest = (): void => {
		const props = this.props;
		const application = this.state.application!;
		sendTest({id: application._id}).then((result) => {
			this.setState({application: {...application, showTest: Boolean(result)}});
			if (result) {
				props.showNotification({
					view: 'success',
					text: props.translates.project.applications.application.testSent,
					timeout: true
				});
			}
		});
	};

	private _boost = (): void => {
		const project = this.state.project;
		if (!project) {
			return;
		}
		const props = this.props;
		projectBoost({id: project._id})
			.then(() => {
				props.showNotification({
					view: 'success',
					text: props.translates.notifications.projectRaised,
					timeout: true
				});
				props.loadViewer();
			})
			.catch((error) => {
				if (hasErrorCode(error, 'QUOTA_EXCEEDED')) {
					props.showNotification({
						view: 'error',
						text: props.translates.errors.QUOTA_EXCEEDED,
						timeout: true
					});
				}
				if (hasErrorCode(error, 'ALREADY_BOOSTED')) {
					props.showNotification({
						view: 'error',
						text: props.translates.errors.ALREADY_BOOSTED,
						timeout: true
					});
				}
				if (hasErrorCode(error, 'PROJECT_NOT_FOUND')) {
					props.showNotification({
						view: 'error',
						text: props.translates.errors.PROJECT_NOT_FOUND,
						timeout: true
					});
				}
			});
	};

	private _renderSide = (): React.ReactNode => {
		const t = this.props.translates;
		const project = this.state.project;
		if (!project) {
			return null;
		}
		return (
			<>
				<ProjectView project={project} />
				{project.status === 'archived' ? <Warning margin>{t.projectFinished}</Warning> : null}
				<div className={b('buttons')}>
					<Hint content={t.edit}>
						<Button
							icon={<SvgIcon url={editIcon} />}
							disabled={project.status === 'archived'}
							url={`/project/${project._id}/edit`}
						/>
					</Hint>
					{project.status === 'draft' ? (
						<Hint content={t.publish}>
							<Button
								icon={<SvgIcon url={checkIcon} stroke noFill />}
								onClick={() => this.setState({showPublishDialog: true})}
							/>
						</Hint>
					) : (
						<>
							<Hint content={t.raiseToTheTop}>
								<Button
									icon={<SvgIcon url={fireIcon} />}
									disabled={project.status === 'archived'}
									onClick={() => this._boost()}
								/>
							</Hint>
							<Hint content={t.markAsFinished}>
								<Button
									icon={<SvgIcon url={checkIcon} stroke noFill />}
									disabled={project.status === 'archived'}
									onClick={() => this.setState({showArchiveDialog: true})}
								/>
							</Hint>
						</>
					)}
					<Hint content={t.delete}>
						<Button
							view="secondary"
							icon={<SvgIcon url={deleteIcon} />}
							disabled={project.status === 'archived'}
							onClick={() => this.setState({showDeleteDialog: true})}
						/>
					</Hint>
				</div>
				{this._renderArchiveDialog()}
				{this._renderDeleteDialog()}
				{this._renderPublishDialog()}
			</>
		);
	};

	private _renderRecommendedContractors = (): React.ReactNode => {
		const t = this.props.translates;
		const state = this.state;
		const project = state.project;
		const applications = state.applications;
		const filter = state.filter;
		const contractors = state.recommendedContractors;
		if (
			!project ||
			!applications ||
			applications.length > 0 ||
			!filter ||
			!filter.isUnread ||
			!contractors ||
			contractors.length === 0
		) {
			return null;
		}
		return (
			<>
				<PageTitle>{t.featured}</PageTitle>
				<SizedItemsList
					className={b('sized-list')}
					gutter={16}
					emptyMessage={t.empty}
					pageInfo={state.pageInfo}
					onPageChange={() => undefined}
				>
					{contractors.map((user) => (
						<ContractorCard
							user={user}
							specialties={project.specialties.map((specialty) => specialty._id)}
							openPage
							key={user._id}
						/>
					))}
				</SizedItemsList>
			</>
		);
	};

	private _renderList = (): React.ReactNode => {
		const t = this.props.translates;
		const state = this.state;
		const project = state.project;
		const applications = state.applications;
		const filter = state.filter;
		if (!project || project.status === 'draft' || !applications || !filter) {
			return null;
		}
		const options = COUNT_OPTIONS.map((value) => ({
			value,
			title: t.project.applications.countOptions[value],
			count: state.count?.[value]
		}));
		return (
			<div className={b('list')}>
				<div className={b('header')}>
					<PageTitle red noMargin>
						{t.applications}
					</PageTitle>
					<CountFilters
						value={getApplicationsCounterFiltersValue(filter)}
						items={options}
						onChange={this._setFilter}
						compact
					/>
				</div>
				<Warning info>{t.projectApplicationsDisclaimer}</Warning>
				<SizedItemsList
					className={b('sized-list')}
					gutter={16}
					emptyMessage={t.empty}
					pageInfo={state.pageInfo}
					onPageChange={() => undefined}
				>
					{applications.map((application) => (
						<ContractorCard
							user={application.author}
							specialties={project.specialties.map((specialty) => specialty._id)}
							onClick={() => this._openApplication(application)}
							key={application._id}
						/>
					))}
				</SizedItemsList>
				{this._renderRecommendedContractors()}
			</div>
		);
	};

	private _renderArchiveDialog = (): React.ReactNode => {
		const t = this.props.translates;
		return (
			<Dialog
				isOpen={this.state.showArchiveDialog}
				onClose={() => this.setState({showArchiveDialog: false})}
				showClose
			>
				<div className={b('dialog')}>
					<div className={b('rejection-question')}>{t.project.applications.archiveDialog.title}</div>
					<div className={b('rejection-disclaimer')}>{t.project.applications.archiveDialog.description}</div>
					<div className={b('dialog-buttons')}>
						<Button
							className={b('dialog-button')}
							view="secondary"
							text={t.buttons.cancel}
							onClick={() => this.setState({showArchiveDialog: false})}
						/>
						<Button className={b('dialog-button')} text={t.buttons.accept} onClick={this._archive} />
					</div>
				</div>
			</Dialog>
		);
	};

	private _renderDeleteDialog = (): React.ReactNode => {
		const t = this.props.translates;
		return (
			<Dialog
				isOpen={this.state.showDeleteDialog}
				onClose={() => this.setState({showDeleteDialog: false})}
				showClose
			>
				<div className={b('dialog')}>
					<div className={b('rejection-question')}>{t.project.applications.deleteDialog.title}</div>
					<div className={b('rejection-disclaimer')}>{t.project.applications.deleteDialog.description}</div>
					<div className={b('dialog-buttons')}>
						<Button
							className={b('dialog-button')}
							view="secondary"
							text={t.buttons.cancel}
							onClick={() => this.setState({showDeleteDialog: false})}
						/>
						<Button className={b('dialog-button')} text={t.buttons.accept} onClick={this._delete} />
					</div>
				</div>
			</Dialog>
		);
	};

	private _renderPublishDialog = (): React.ReactNode => {
		const t = this.props.translates;
		return (
			<Dialog
				isOpen={this.state.showPublishDialog}
				onClose={() => this.setState({showPublishDialog: false})}
				showClose
			>
				<div className={b('dialog')}>
					<div className={b('rejection-question')}>{t.project.applications.publishDialog.title}</div>
					<div className={b('dialog-buttons')}>
						<Button
							className={b('dialog-button')}
							view="secondary"
							text={t.buttons.cancel}
							onClick={() => this.setState({showPublishDialog: false})}
						/>
						<Button className={b('dialog-button')} text={t.buttons.accept} onClick={this._publish} />
					</div>
				</div>
			</Dialog>
		);
	};

	private _renderRejectDialog = (): React.ReactNode => {
		const t = this.props.translates;
		return (
			<Dialog
				isOpen={this.state.showRejectDialog}
				onClose={() => this.setState({showRejectDialog: false})}
				showClose
			>
				<div className={b('dialog')}>
					<div className={b('rejection-question')}>{t.project.applications.rejectDialog.title}</div>
					<div className={b('rejection-disclaimer')}>{t.project.applications.rejectDialog.description}</div>
					<div className={b('dialog-buttons')}>
						<Button
							className={b('dialog-button')}
							view="secondary"
							text={t.buttons.cancel}
							onClick={() => this.setState({showRejectDialog: false})}
						/>
						<Button className={b('dialog-button')} text={t.buttons.decline} onClick={this._reject} />
					</div>
				</div>
			</Dialog>
		);
	};

	private _renderApproveDialog = (): React.ReactNode => {
		const t = this.props.translates;
		return (
			<Dialog
				isOpen={this.state.showApproveDialog}
				onClose={() => this.setState({showApproveDialog: false})}
				showClose
			>
				<div className={b('dialog')}>
					<div className={b('rejection-question')}>{t.project.applications.approveDialog.title}</div>
					<div className={b('dialog-buttons')}>
						<Button
							className={b('dialog-button')}
							view="secondary"
							text={t.buttons.cancel}
							onClick={() => this.setState({showRejectDialog: false})}
						/>
						<Button className={b('dialog-button')} text={t.buttons.accept} onClick={this._approve} />
					</div>
				</div>
			</Dialog>
		);
	};

	private _renderCongratulationDialog = () => {
		const t = this.props.translates;
		return (
			<Dialog
				isOpen={this.state.showCongratulationDialog}
				onClose={() => this.setState({showCongratulationDialog: false})}
				showClose
				overlayClose
			>
				<div className={b('congratulation__wrapper')}>
					<h2 className={b('congratulation__title')}>{t.project.applications.congratulationDialog.title}</h2>
					<div className={b('congratulation__list-title')}>
						{t.project.applications.congratulationDialog.listTitle}
					</div>
					<ul className={b('congratulation__list')}>
						<li className={b('congratulation__list__item')}>
							{t.project.applications.congratulationDialog.listItems[0]}
						</li>
						<li className={b('congratulation__list__item')}>
							{t.project.applications.congratulationDialog.listItems[1]}
						</li>
						<li className={b('congratulation__list__item')}>
							{t.project.applications.congratulationDialog.listItems[2]}
						</li>
						<li className={b('congratulation__list__item')}>
							{t.project.applications.congratulationDialog.listItems[3]}
						</li>
					</ul>
					<div className={b('congratulation__subtitle')}>
						{t.project.applications.congratulationDialog.subtitle}
					</div>
					<Button
						className={b('congratulation__button')}
						text={t.buttons.continue}
						onClick={() => this.setState({showCongratulationDialog: false})}
					/>
				</div>
			</Dialog>
		);
	};

	private _renderApplication = (application: ProjectApplication): React.ReactNode => {
		const t = this.props.translates;
		const author = application.author;
		if (!this.state.project) {
			return null;
		}
		const project = this.state.project!;
		const isActive = project.status === 'active' && application.status === 'active';
		const test = project.test;
		const hasTest = project.status === 'active' && Boolean(test?.file || test?.description);
		const website = author.website || '';
		const url =
			website && !website.startsWith('http://') && !website.startsWith('https://')
				? 'https://' + website
				: website;
		return (
			<div className={b('application')}>
				<div className={b('author')}>
					<div className={b('author-head')}>
						<LinkWrapper className={b('author-info')} url={`/profile/${author.username}`}>
							<Avatar user={author} size={64} />
							<div className={b('author-name')}>
								<div className={b('author-firstname')}>{author.firstName}</div>
								<div>{author.lastName}</div>
							</div>
						</LinkWrapper>
						<div className={b('author-specialties')}>
							{author.specialties?.map((specialty) => (
								<div
									className={b('specialty', {
										active: Boolean(
											project.specialties.find(
												(lookupSpecialty) => lookupSpecialty._id === specialty._id
											)
										)
									})}
									key={specialty._id}
								>
									{specialty.title}
								</div>
							))}
						</div>
					</div>
				</div>
				{application.description ? (
					<div className={b('block')}>
						<div className={b('block-title')}>{t.project.applications.application.whyMe}</div>
						<div>{application.description}</div>
					</div>
				) : null}
				{application.shiftCost || application.budget ? (
					<div className={b('block')}>
						<div className={b('block-title')}>{t.project.applications.application.myExpectations}</div>
						<div>
							{application.shiftCost ? (
								<div className={b('budget-item')}>
									<div className={b('budget-item-title')}>{t.payment}</div>
									<div className={b('budget-item-value')}>
										{getLocalePrice(application.shiftCost, project.paycheck.currency)}
									</div>
								</div>
							) : null}
						</div>
					</div>
				) : null}
				{author.email || author.phone || website ? (
					<div className={b('block')}>
						<div className={b('block-title')}>{t.contacts}</div>
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
				{hasTest ? (
					<div className={b('application-test')}>
						{application.showTest ? (
							<div className={b('application-test-sent')}>
								{t.project.applications.application.testSent}
							</div>
						) : (
							isActive && (
								<div className={b('application-test-send')}>
									<Button
										text={t.project.applications.application.sendTest}
										onClick={this._sendTest}
									/>
								</div>
							)
						)}
					</div>
				) : null}
				<div className={b('send-message')}>
					<Button
						text={t.project.applications.application.message}
						onClick={() => this.props.openUserChat(author)}
					/>
				</div>
				{isActive ? (
					<div className={b('application-buttons')}>
						<Button
							className={b('application-button')}
							view="secondary"
							text={t.buttons.decline}
							onClick={this._showRejectDialog}
						/>
						<Button
							className={b('application-button')}
							text={t.buttons.choose}
							onClick={this._showApproveDialog}
						/>
						<Button
							className={b('application-button')}
							view="invisible"
							text={t.buttons.continue}
							onClick={this._backToList}
						/>
					</div>
				) : (
					<div className={b('application-buttons')}>
						<Button
							className={b('application-button')}
							view="invisible"
							text={t.buttons.back}
							onClick={this._backToList}
						/>
					</div>
				)}
				{this._renderRejectDialog()}
				{this._renderApproveDialog()}
			</div>
		);
	};

	render(): React.ReactNode {
		const application = this.state.application;
		return (
			<div className={b()}>
				<FixedSideView side={this._renderSide()}>
					{application ? this._renderApplication(application) : this._renderList()}
				</FixedSideView>
				{this._renderCongratulationDialog()}
			</div>
		);
	}
}

export default connect(ProjectViewPage);
