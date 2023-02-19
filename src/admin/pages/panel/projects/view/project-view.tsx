import './project-view.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import {withRouter, RouteComponentProps} from 'react-router';
import Button from '@/common/views/button/button';
import ProjectLoader from '@/common/views/project-loader/project-loader';
import {
	Project,
	ProjectApplicationsFilter,
	ProjectApplication,
	ProjectApplicationsCounter
} from '@/common/types/project';
import ProjectView from '@/web/views/project-view/project-view';
import FixedSideView from '@/web/views/fixed-side-view/fixed-side-view';
import CountFilters, {CountItem} from '@/web/views/count-filters/count-filters';
import {isEqual} from 'lodash';
import {getProjectApplications} from '@/web/actions/data-provider';
import {PaginationInfo} from '@/common/types';
import {getApplicationsFilter, getApplicationsCounterFiltersValue} from '@/web/utils/project-utils';
import PageTitle from '@/web/views/page-title/page-title';
import SizedItemsList from '@/common/views/sized-items-list/sized-items-list';
import ContractorCard from '@/web/views/contractor-card/contractor-card';

interface State {
	project?: Project;
	filter?: ProjectApplicationsFilter;
	applications?: ProjectApplication[];
	count?: ProjectApplicationsCounter;
	pageInfo?: PaginationInfo;
}

type Props = RouteComponentProps<{id: string}>;

const COUNT_OPTIONS: CountItem[] = [
	{title: 'Поданные', value: 'active'},
	{title: 'Выслано задание', value: 'test'},
	{title: 'Выбранные', value: 'accepted'},
	{title: 'Отклоненные', value: 'rejected'},
	{title: 'Приглашения', value: 'invites'}
];

const b = classname('project-view-page');

class ProjectViewPage extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {};
	}

	componentDidUpdate(_props: Props, state: State) {
		if (!isEqual(state.filter, this.state.filter)) {
			this._loadApplications();
		}
	}

	private _loadApplications = (): void => {
		const state = this.state;
		if (!state.project) {
			return;
		}
		const filter = state.filter || {status: 'active'};
		getProjectApplications({filter: {...filter, project: state.project._id}}).then((data) => {
			if (data) {
				this.setState({
					applications: data.items,
					count: data.count,
					pageInfo: data.pageInfo
				});
			}
		});
	};

	private _setFilter = (type: string): void => {
		const filter = this.state.filter!;
		this.setState({
			filter: getApplicationsFilter(filter, type)
		});
	};

	private _onProjectLoad = (project?: Project): void => {
		this.setState({project}, this._loadApplications);
	};

	private _renderBack = (): React.ReactNode => {
		return <Button className={b('back')} text="Назад" onClick={this.props.history.goBack} />;
	};

	private _renderContent = (): React.ReactNode => {
		if (!this.state.project) {
			return this._renderBack();
		}

		return (
			<>
				<ProjectView project={this.state.project} />
				{this._renderBack()}
			</>
		);
	};

	private _renderList = (): React.ReactNode => {
		const state = this.state;
		const project = state.project;
		const applications = state.applications || [];
		const filter = state.filter;
		return (
			<div className={b('list')}>
				<div className={b('header')}>
					<PageTitle red noMargin>
						Заявки
					</PageTitle>
					<CountFilters
						value={filter ? getApplicationsCounterFiltersValue(filter) : 'active'}
						items={COUNT_OPTIONS}
						onChange={this._setFilter}
						compact
					/>
				</div>
				<SizedItemsList
					className={b('sized-list')}
					gutter={16}
					emptyMessage="Пусто."
					pageInfo={state.pageInfo}
					onPageChange={() => undefined}
				>
					{applications.map((application) => (
						<ContractorCard
							user={application.author}
							specialties={project?.specialties.map((specialty) => specialty._id)}
							onClick={() => this.props.history.push(`/panel/user/${application.author.username}`)}
							key={application._id}
						/>
					))}
				</SizedItemsList>
			</div>
		);
	};

	render(): React.ReactNode {
		return (
			<div className={b()}>
				<ProjectLoader id={this.props.match.params.id} onChange={this._onProjectLoad} />
				<FixedSideView width={360} side={this._renderContent()}>
					{this._renderList()}
				</FixedSideView>
			</div>
		);
	}
}

export default withRouter(ProjectViewPage);
