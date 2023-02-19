import './portfolio-list.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import Card from '@/common/views/card/card';
import Proportion from '@/common/views/proportion/proportion';
import classname from '@/common/core/classname';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import {RouteComponentProps, withRouter} from 'react-router';
import {PortfolioProject} from '@/common/types/portfolio-project';
import {GetPortfolioFilter, getPortfolioProjects, sendMetrics} from '@/web/actions/data-provider';
import appActions from '@/web/actions/app-actions';
import PortfolioProjectCard from '@/web/views/portfolio-project-card/portfolio-project-card';
import PortfolioProjectPreview from '@/web/views/portfolio-project-preview/portfolio-project-preview';
import {isEqual} from 'lodash-es';
import asyncAction, {AsyncAction} from '@/common/core/async-action/async-action';
import {Viewer} from '@/common/types/user';
import AppState from '@/web/state/app-state';
import composeConnect from '@/common/core/compose/compose';
import Preloader from '@/common/views/preloader/preloader';
import SizedItemsList from '@/common/views/sized-items-list/sized-items-list';
import PageTitle from '@/web/views/page-title/page-title';
import CountFilters from '@/web/views/count-filters/count-filters';
import Dialog from '@/common/views/dialog/dialog';
import {TranslatesContext} from '@/common/views/translates-provider/translates-provider';

import closeIcon from '@/common/icons/close.svg';

interface StateToProps {
	viewer: Viewer;
}

const mapDispatchToProps = {
	updateViewer: appActions.updateViewer
};

type ReduxProps = StateToProps & typeof mapDispatchToProps;

interface SelfProps {}

type Props = SelfProps & ReduxProps & RouteComponentProps;

interface State {
	projects: PortfolioProject[];
	filter: GetPortfolioFilter;
	loading: boolean;
	showAdviceDialog: boolean;
}

const connect = composeConnect<SelfProps, ReduxProps, RouteComponentProps>(
	ReactRedux.connect((state: AppState): StateToProps => ({viewer: state.viewer!}), mapDispatchToProps),
	withRouter
);

const b = classname('portfolio-list-page');

class PortfolioListPage extends React.PureComponent<Props, State> {
	private _loadProjectsAction?: AsyncAction;
	static contextType = TranslatesContext;

	constructor(props: Props) {
		super(props);

		this.state = {
			projects: [],
			filter: {
				author: props.viewer._id
			},
			loading: false,
			showAdviceDialog: false
		};
	}

	componentDidMount() {
		this._loadProjects();
	}

	componentDidUpdate(_props: Props, state: State) {
		if (!isEqual(state.filter, this.state.filter)) {
			this._loadProjects();
		}
	}

	private _loadProjects = (): void => {
		asyncAction.cancel(this._loadProjectsAction);
		this.setState({loading: true});

		const filter = this.state.filter;
		this._loadProjectsAction = asyncAction.create(getPortfolioProjects(filter), {
			success: (projects) => this.setState({projects}),
			always: () => this.setState({loading: false})
		});
	};

	private _onSpecialtyFilterClick = (specialty?: string): void => {
		this.setState({
			filter: {
				author: this.props.viewer._id,
				specialty
			}
		});
	};

	private _closeDialog = () => {
		sendMetrics({type: 'modals_isFirstAdviceInPortfolio', data: true}).then(() => {
			this.props.updateViewer({
				...this.props.viewer,
				modals: {...this.props.viewer.modals, isFirstAdviceInPortfolio: true}
			});
			this.setState({showAdviceDialog: false});
		});
	};

	private _renderAddProject = (): React.ReactNode => {
		const t = this.context.translates;
		return (
			<Card size="none" view="light" rounded shadow key={-1}>
				<Proportion h={3} w={4}>
					<div className={b('add')} onClick={() => this.props.history.push('/portfolio/add')}>
						<div className={b('add-icon')}>
							<SvgIcon url={closeIcon} width={16} height={16} />
						</div>
						<div className={b('add-text')}>{t['addProjectToPortfolio']}</div>
					</div>
				</Proportion>
			</Card>
		);
	};

	private _renderFilters = (): React.ReactNode => {
		const specialtyFilter = this.state.filter?.specialty;
		const specialties = (this.props.viewer.specialties || []).filter(Boolean);
		const lang = this.context.lang;
		const items = [{title: this.context.translates.projectPeriodLabels.all, value: 'all'}].concat(
			specialties.map((specialty) => {
				return {
					title: specialty.titles![lang] || specialty.title,
					value: specialty._id
				};
			})
		);
		return (
			<CountFilters
				value={specialtyFilter}
				items={items}
				defaultValue="all"
				onChange={(value) => this._onSpecialtyFilterClick(value === 'all' ? undefined : value)}
				compact
			/>
		);
	};

	private _renderList = (): React.ReactNode => {
		const projects = this.state.projects;
		return (
			<div className={b('list')}>
				<PortfolioProjectPreview projects={projects} onRemove={this._loadProjects}>
					{({showPreview}) => (
						<SizedItemsList gutter={16}>
							{this._renderAddProject()}
							{projects.map((project, index) => (
								<PortfolioProjectCard
									title={project.title}
									specialty={project.specialty?.title}
									views={project.views}
									link={project.link}
									thumbnail={project.thumbnail}
									attachment={project.attachment}
									onClick={() => showPreview(index)}
									key={project._id}
								/>
							))}
						</SizedItemsList>
					)}
				</PortfolioProjectPreview>
			</div>
		);
	};

	private _renderAdviceDialog = (): React.ReactNode => {
		const projects = this.state.projects;
		// const isFirstAdviceInPorfolio = localStorage.getItem('isFirstAdviceInPorfolio');
		const isFirstAdviceInPortfolio = this.props.viewer.modals.isFirstAdviceInPortfolio;
		if (projects && projects.length === 0 && !isFirstAdviceInPortfolio) {
			this.setState({showAdviceDialog: true});
			// localStorage.setItem('isFirstAdviceInPorfolio', 'false');
		}
		const t = this.context.translates;
		return (
			<Dialog isOpen={this.state.showAdviceDialog} onClose={this._closeDialog} overlayClose showClose>
				<div className={b('congratulation-wrapper')}>
					<h2 className={b('congratulation-title')}>{t.portfolioListDialog?.[0]}</h2>
					<div className={b('congratulation-subtitle')}>{t.portfolioListDialog?.[1]}</div>
					<div className={b('congratulation-subtitle')}>{t.portfolioListDialog?.[2]}</div>
					<div className={b('congratulation-subtitle')}>{t.portfolioListDialog?.[3]}</div>
					<div className={b('congratulation-subtitle')}>{t.portfolioListDialog?.[4]}</div>
					<div className={b('congratulation-subtitle')}>{t.portfolioListDialog?.[5]}</div>
				</div>
			</Dialog>
		);
	};

	render(): React.ReactNode {
		const t = this.context.translates;
		return (
			<>
				<div className={b('head')}>
					<PageTitle noMargin>{t['portfolio']}</PageTitle>
					{this._renderFilters()}
				</div>
				{this._renderList()}
				{this._renderAdviceDialog()}
				{this.state.loading ? <Preloader overlay /> : null}
			</>
		);
	}
}

export default connect(PortfolioListPage);
