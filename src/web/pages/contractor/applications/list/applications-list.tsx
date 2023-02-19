import './applications-list.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import SizedItemsList from '@/common/views/sized-items-list/sized-items-list';
import PageTitle from '@/web/views/page-title/page-title';
import {ApplicationsCount, ProjectApplication} from '@/common/types/project';
import {getMyApplications, getMyApplicationsCount} from '@/web/actions/data-provider';
import {PaginationInfo} from '@/common/types';
import ContractorProjectCard from '@/web/views/contractor-project-card/contractor-project-card';
import CountFilters, {CountItem} from '@/web/views/count-filters/count-filters';
import Card from '@/common/views/card/card';
import {getEstimate} from '@/web/utils/date-utils';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';

interface Props extends I18nProps {}

interface State {
	status: string;
	loading: boolean;
	items: ProjectApplication[];
	pagination?: PaginationInfo;
	page: number;
	count?: ApplicationsCount;
}

const COUNT_FILTERS: Omit<CountItem, 'count' | 'title'>[] = [
	{
		value: 'active'
	},
	{
		value: 'accepted',
		check: (value) => ['accepted', 'rejected'].includes(value || '')
	}
];

const COUNT_ARCHIVE_FILTERS = ['accepted', 'rejected'];

const b = classname('applications-list-page');

class ApplicationsListPage extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			status: 'active',
			loading: false,
			items: [],
			page: 1
		};
	}

	componentDidMount() {
		this._load();
		getMyApplicationsCount().then((count) => {
			this.setState({count});
		});
	}

	componentDidUpdate(_props: Props, state: State) {
		if (state.status !== this.state.status) {
			this._load();
		}
	}

	private _load = (): void => {
		const state = this.state;
		this.setState({loading: true});
		getMyApplications({status: state.status})
			.then((search) => {
				this.setState({
					items: search?.items || [],
					pagination: search?.pageInfo,
					page: search?.pageInfo.currentPage || 1
				});
			})
			.finally(() => {
				this.setState({loading: false});
			});
	};

	private _renderCardBottom = (application: ProjectApplication): React.ReactNode => {
		const t = this.props.translates;
		const project = application.project;
		const estimate = project.applicationEst || 0;
		return (
			<Card view="light" rounded="small" className={b('applications')}>
				{project.endDate ? (
					estimate > 0 ? (
						<div className={b('keyvalue')}>
							<div className={b('keyvalue-title')}>{t.pages.contractor.applications.list.card.until}</div>
							<div className={b('keyvalue-value')}>{getEstimate(estimate)}</div>
						</div>
					) : (
						<div className={b('finished')}>{t.pages.contractor.applications.list.card.ended}</div>
					)
				) : null}
				<div className={b('keyvalue')}>
					<div className={b('keyvalue-title')}>{t.pages.contractor.applications.list.card.count}</div>
					<div className={b('keyvalue-value')}>{project.counters?.applications}</div>
				</div>
			</Card>
		);
	};

	private _renderList = (): React.ReactNode => {
		const state = this.state;
		const items = state.items;
		const status = state.status;
		const filterItems = COUNT_ARCHIVE_FILTERS.map((value) => ({
			value,
			title: this.props.translates.pages.contractor.applications.list.archiveFilters[value],
			count: state.count?.[value]
		}));
		const applications = items.filter((application) => Boolean(application.project));
		return (
			<div className={b('list')}>
				{status === 'accepted' || status === 'rejected' ? (
					<div className={b('archive-filters')}>
						<CountFilters
							value={state.status}
							items={filterItems}
							onChange={(status) => this.setState({status})}
						/>
					</div>
				) : null}
				<SizedItemsList gutter={16}>
					{applications.map((application) => (
						<ContractorProjectCard
							project={application.project}
							bottom={status === 'active' ? this._renderCardBottom(application) : undefined}
							openPage
							key={application._id}
						/>
					))}
				</SizedItemsList>
				{!state.loading && items.length === 0 ? (
					<div className={b('empty')}>{this.props.translates.empty}</div>
				) : null}
			</div>
		);
	};

	private _renderFilters = (): React.ReactNode => {
		const state = this.state;
		const count = state.count;
		if (!count) {
			return null;
		}
		const items = COUNT_FILTERS.map((item) => {
			return {
				...item,
				title: this.props.translates.pages.contractor.applications.list.filters[item.value],
				count: count[item.value]
			};
		});
		return (
			<div className={b('filters')}>
				<CountFilters value={state.status} items={items} onChange={(status) => this.setState({status})} />
			</div>
		);
	};

	render(): React.ReactNode {
		return (
			<div className={b()}>
				<div className={b('head')}>
					<PageTitle className={b('page-title')} red noMargin>
						{this.props.translates.pages.contractor.applications.list.title}
					</PageTitle>
					{this._renderFilters()}
				</div>
				{this._renderList()}
			</div>
		);
	}
}

export default i18nConnect(ApplicationsListPage);
