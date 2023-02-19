import './project-suitable.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import asyncAction, {AsyncAction} from '@/common/core/async-action/async-action';
import {searchProjects, searchProjectsCount} from '@/web/actions/data-provider';
import {Project, ProjectPeriod, SearchProjectFilter, SearchProjectsCountOutput} from '@/common/types/project';
import ContractorProjectCard from '@/web/views/contractor-project-card/contractor-project-card';
import SizedItemsList from '@/common/views/sized-items-list/sized-items-list';
import {isEqual} from 'lodash-es';
import {PaginationInfo} from '@/common/types';
import Pagination from '@/common/views/pagination/pagination';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import LinkWrapper from '@/common/views/link-wrapper/link-wrapper';
import PageTitle from '@/web/views/page-title/page-title';
import CountFilters from '@/web/views/count-filters/count-filters';
import AppState from '@/web/state/app-state';
import Hint from '@/common/views/hint/hint';
import {TranslatesContext, i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';

import filtersIcon from '@/common/icons/filters.svg';

interface StateToProps {
	isMobileLayout?: boolean;
}

interface SelfProps {}

type Props = SelfProps & StateToProps & I18nProps;

interface State {
	loading: boolean;
	projects: Project[];
	count?: SearchProjectsCountOutput;
	filter: SearchProjectFilter;
	pagination?: PaginationInfo;
	page: number;
}

const LIST_LIMITS = {
	480: 2,
	720: 3,
	1024: 4,
	1600: 5
};

const PERIOD_FILTER_KEYS = [
	'total',
	ProjectPeriod.BEFORE,
	ProjectPeriod.IN_DAY,
	ProjectPeriod.AFTER,
	ProjectPeriod.WHOLE
];

const connect = ReactRedux.connect((state: AppState): StateToProps => ({isMobileLayout: state.isMobileLayout}));

const b = classname('project-suitable-page');

class ProjectSuitablePage extends React.PureComponent<Props, State> {
	private _loadProjectsAction?: AsyncAction;
	private _loadProjectsCountAction?: AsyncAction;
	static contextType = TranslatesContext;
	constructor(props: Props) {
		super(props);

		this.state = {
			loading: false,
			projects: [],
			page: 1,
			filter: {
				type: undefined,
				period: undefined,
				hideTest: false,
				nonCommercial: false,
				paycheckAmount: 0,
				budgetFrom: 0,
				onlyPremium: false
			}
		};
	}

	componentDidMount() {
		this._loadProjects();
		this._loadProjectsCount();
	}

	componentDidUpdate(_props: Props, state: State) {
		if (!state.loading) {
			if (!isEqual(state.filter, this.state.filter) || state.page !== this.state.page) {
				this._loadProjects();
			}
			if (state.filter.period !== this.state.filter.period) {
				this._loadProjectsCount();
			}
		}
	}

	private _loadProjects = (): void => {
		asyncAction.cancel(this._loadProjectsAction);

		this.setState({loading: true});
		this._loadProjectsAction = asyncAction.create(searchProjects(this.state.filter, this.state.page), {
			success: (data) => {
				this.setState({
					projects: data?.items || [],
					pagination: data?.pageInfo,
					page: data?.pageInfo.currentPage || 1
				});
			},
			always: () => this.setState({loading: false})
		});
	};

	private _loadProjectsCount = (): void => {
		asyncAction.cancel(this._loadProjectsCountAction);

		this._loadProjectsCountAction = asyncAction.create(searchProjectsCount(this.state.filter), {
			success: (count) => this.setState({count})
		});
	};

	private _setPeriodFilter = (value: ProjectPeriod | 'total'): void => {
		this.setState({
			filter: {
				...this.state.filter,
				period: value !== 'total' ? (value as ProjectPeriod) : undefined
			}
		});
	};

	private _renderFilters = (): React.ReactNode => {
		const props = this.props;
		const state = this.state;
		const count = state.count;
		if (!count) {
			return null;
		}
		const t = this.context.translates;
		const items = PERIOD_FILTER_KEYS.map((value: ProjectPeriod) => ({
			value,
			title: t.projectPeriodLabels[value] || '',
			count: count[value]
		}));
		return (
			<div className={b('filters')}>
				{props.isMobileLayout ? null : (
					<CountFilters<ProjectPeriod>
						value={state.filter.period}
						items={items}
						defaultValue={'total' as ProjectPeriod}
						onChange={this._setPeriodFilter}
						compact
					/>
				)}
				<Hint position="bottom" content={t.searchParams}>
					<LinkWrapper className={b('filters-icon')} url="/search">
						<SvgIcon url={filtersIcon} width={16} height={16} />
					</LinkWrapper>
				</Hint>
			</div>
		);
	};

	private _renderList = (): React.ReactNode => {
		const state = this.state;
		const projects = state.projects;
		return (
			<div className={b('list')}>
				<SizedItemsList limits={LIST_LIMITS} gutter={16}>
					{projects.map((project) => (
						<ContractorProjectCard project={project} openPage key={project._id} />
					))}
				</SizedItemsList>
				<Pagination
					value={state.pagination?.currentPage}
					max={state.pagination?.pageCount}
					onChange={(page) => this.setState({page})}
				/>
				{projects.length === 0 ? (
					<div className={b('empty')}>{this.props.translates.pages.contractor.project.suitable.notFound}</div>
				) : null}
			</div>
		);
	};

	render(): React.ReactNode {
		return (
			<div className={b()}>
				<div className={b('head')}>
					<PageTitle noMargin>{this.props.translates.pages.contractor.project.suitable.title}</PageTitle>
					{this._renderFilters()}
				</div>
				{this._renderList()}
			</div>
		);
	}
}

export default connect(i18nConnect(ProjectSuitablePage));
