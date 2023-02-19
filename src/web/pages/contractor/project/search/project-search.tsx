import './project-search.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import FixedSideView from '@/web/views/fixed-side-view/fixed-side-view';
import Label from '@/common/views/label/label';
import BadgeSelector from '@/common/views/badge-selector/badge-selector';
import {
	Project,
	ProjectPeriod,
	ProjectType,
	SearchProjectFilter,
	SearchProjectsCountOutput
} from '@/common/types/project';
import AppState from '@/web/state/app-state';
import appActions from '@/web/actions/app-actions';
import PageTitle from '@/web/views/page-title/page-title';
import Checkbox from '@/common/views/checkbox/checkbox';
import {Formik, FormikHelpers, FormikProps} from 'formik';
import Input from '@/common/views/input/input';
import Button from '@/common/views/button/button';
import {searchProjects, searchProjectsCount, sendMetrics} from '@/web/actions/data-provider';
import {PaginationInfo} from '@/common/types';
import SizedItemsList from '@/common/views/sized-items-list/sized-items-list';
import ContractorProjectCard from '@/web/views/contractor-project-card/contractor-project-card';
import Pagination from '@/common/views/pagination/pagination';
import SubscriptionBadge from '@/common/views/subscription-badge/subscription-badge';
import IconInfo from '@/common/views/icon-info/icon-info';
import Hint from '@/common/views/hint/hint';
import {getPaycheckOptions} from '@/web/utils/project-utils';
import CountFilters from '@/web/views/count-filters/count-filters';
import composeConnect from '@/common/core/compose/compose';
import customEventConnect, {CustomEventProps} from '@/common/utils/custom-event-connect';
import {Viewer} from '@/common/types/user';
import FullnessWarning from '@/web/views/fullness-warning-view/fullness-warning-view';
import {updateSearch, parseSearch} from '@/common/utils/search-utils';
import {withRouter, RouteComponentProps} from 'react-router';
import ConditionalRender from '@/common/views/conditional-render/conditional-render';
import {isSearchAvailable} from '@/web/utils/user-utils';
import Warning from '@/common/views/warning/warning';
import Dialog from '@/common/views/dialog/dialog';
import LinkWrapper from '@/common/views/link-wrapper/link-wrapper';
import {TranslatesContext} from '@/common/views/translates-provider/translates-provider';

type SearchFilter = SearchProjectFilter & {page?: number};

const initialValues: SearchFilter = {
	type: undefined,
	period: undefined,
	hideTest: false,
	nonCommercial: false,
	paycheckType: undefined,
	paycheckAmount: 0,
	budgetFrom: 0,
	onlyPremium: false,
	page: 1
};

const mapDispatchToProps = {
	loadProjectTypes: appActions.loadProjectTypes,
	updateViewer: appActions.updateViewer
};

interface StateToProps {
	viewer: Viewer;
	projectTypes: ProjectType[];
	isMobileLayout?: boolean;
}

type ReduxProps = StateToProps & typeof mapDispatchToProps;

interface SelfProps {}

type Props = SelfProps & ReduxProps & CustomEventProps & RouteComponentProps;

interface State {
	projects: Project[];
	count?: SearchProjectsCountOutput;
	pagination?: PaginationInfo;
	page: number;
	filter: SearchFilter;
	showFilters: boolean;
}

const connect = composeConnect<SelfProps, ReduxProps, CustomEventProps, RouteComponentProps>(
	ReactRedux.connect(
		(state: AppState): StateToProps => ({
			viewer: state.viewer!,
			projectTypes: state.projectTypes || [],
			isMobileLayout: state.isMobileLayout
		}),
		mapDispatchToProps
	),
	customEventConnect,
	withRouter
);

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

const b = classname('project-search-page');

class ProjectSearchPage extends React.PureComponent<Props, State> {
	static contextType = TranslatesContext;
	constructor(props: Props) {
		super(props);

		const parsed = parseSearch({numbers: true});
		const filter: any = {};
		for (const key in initialValues) {
			filter[key] = parsed[key] || initialValues[key];
		}
		this.state = {
			projects: [],
			page: parseInt(parsed.page) || 1,
			filter,
			showFilters: true
		};
	}

	componentDidMount() {
		const props = this.props;
		props.loadProjectTypes();
		this._load(this.state.filter);
		props.events.on('search', this._showFilters);
	}

	private showDialog = () => {
		const props = this.props;
		const isFirstProjectsSearch = props.viewer.modals?.isFirstProjectsSearch;
		const projects = this.state.projects;

		return projects.length !== 0 && !isFirstProjectsSearch;
	};

	componentWillUnmount() {
		this.props.events.off('search', this._showFilters);
	}

	private _showFilters = (): void => {
		this.setState({showFilters: true});
	};

	private _load = (filter: SearchFilter): Promise<void> => {
		const props = this.props;
		if (!isSearchAvailable(props.viewer)) {
			return Promise.resolve(undefined);
		}
		updateSearch(filter, props.history);
		const page = filter.page;
		delete filter.page;
		return Promise.all([searchProjects(filter, page), searchProjectsCount(filter)]).then(([search, count]) => {
			this.setState({
				projects: search?.items || [],
				pagination: search?.pageInfo,
				page: search?.pageInfo.currentPage || 1,
				count
			});
		});
	};

	private _onSubmit = (filter: SearchFilter, {setSubmitting}: FormikHelpers<SearchFilter>): void => {
		this.setState({filter, showFilters: false});
		this._load(filter).finally(() => {
			setSubmitting(false);
		});
	};

	private _setPeriodFilter = (form: FormikProps<SearchFilter>, value: ProjectPeriod | 'total'): void => {
		form.setFieldValue('period', value !== 'total' ? (value as ProjectPeriod) : undefined);
		form.submitForm();
	};

	private _closeDialog = () => {
		//isFirstProjectsSearch
		sendMetrics({type: 'modals_isFirstProjectsSearch', data: true}).then(() => {
			this.props.updateViewer({
				...this.props.viewer,
				modals: {...this.props.viewer.modals, isFirstProjectsSearch: true}
			});
		});
	};

	private _renderFilters = (form: FormikProps<SearchFilter>): React.ReactNode => {
		const props = this.props;
		const t = this.context.translates;
		const lang = this.context.lang;
		if (props.isMobileLayout && !this.state.showFilters) {
			return null;
		}
		return (
			<div className={b('filters')}>
				<PageTitle red>
					{t['searchParameters']}{' '}
					<Hint position="right" content={t['whatProjectDoYouWantToFind']}>
						<IconInfo />
					</Hint>
				</PageTitle>
				<div className={b('disclaimer')}>{t['searchParametersSubtitle']}</div>
				<div className={b('')}>
					<Label text={t['projectType']} />
					<BadgeSelector
						name="type"
						value={form.values.type}
						getValue={(type) => type.id}
						items={[{id: '', title: t.projectPeriodLabels.all}].concat(props.projectTypes)}
						onChange={form.setFieldValue}
						disabled={form.isSubmitting}
					/>
					<div className={b('checkbox')}>
						<Checkbox
							name="hideTest"
							value={form.values.hideTest}
							setFieldValue={form.setFieldValue}
							disabled={form.isSubmitting}
						>
							{t['dontShowPorjectWithTest']}
						</Checkbox>
						<Checkbox
							name="nonCommercial"
							value={form.values.nonCommercial}
							setFieldValue={form.setFieldValue}
							disabled={form.isSubmitting}
						>
							{t['nonCommercialProjects']}{' '}
							<Hint position="right" content={t['nonCommercialProjectsHint']}>
								<IconInfo size="small" />
							</Hint>
						</Checkbox>
					</div>
					<Label text={t['budgetFrom']} />
					<Input
						name="budgetFrom"
						type="number"
						size="small"
						value={form.values.budgetFrom}
						disabled={form.values.nonCommercial || form.isSubmitting}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
						error={form.touched.budgetFrom && form.errors.budgetFrom}
					/>
					<Label text={t['paymentForPeriod']} />
					<BadgeSelector
						name="paycheckType"
						value={form.values.paycheckType}
						items={[{value: undefined, title: lang === 'ru' ? 'Любой' : 'Any'}].concat(
							getPaycheckOptions(null, lang)
						)}
						disabled={form.values.nonCommercial || form.isSubmitting}
						onChange={form.setFieldValue}
					/>
					<Label text={t['paymentFrom']} />
					<Input
						name="paycheckAmount"
						type="number"
						size="small"
						value={form.values.paycheckAmount}
						disabled={form.values.nonCommercial || form.isSubmitting}
						onChange={form.handleChange}
						onBlur={form.handleBlur}
						error={form.touched.paycheckAmount && form.errors.paycheckAmount}
					/>
					<div className={b('checkbox')}>
						<Checkbox
							name="onlyPremium"
							value={form.values.onlyPremium}
							setFieldValue={form.setFieldValue}
							disabled={form.isSubmitting}
						>
							{t['only']} <SubscriptionBadge premium />
						</Checkbox>
					</div>
					<div className={b('search-button')}>
						<FullnessWarning>
							{(onClick) => (
								<Button
									type="submit"
									text={t['search']}
									onClick={onClick || form.submitForm}
									disabled={!isSearchAvailable(props.viewer)}
								/>
							)}
						</FullnessWarning>
					</div>
				</div>
			</div>
		);
	};

	private _renderList = (form: FormikProps<SearchFilter>): React.ReactNode => {
		const state = this.state;
		const projects = state.projects;
		const isMobileLayout = this.props.isMobileLayout;
		const t = this.context.translates;
		if (isMobileLayout && state.showFilters) {
			return null;
		}

		const items = PERIOD_FILTER_KEYS.map((value: ProjectPeriod) => ({
			value,
			title: t.projectPeriodLabels[value] || t.projectPeriodLabels.all,
			count: state.count?.[value]
		}));
		return (
			<div className={b('list')}>
				{isMobileLayout ? null : (
					<div className={b('list-filters')}>
						<CountFilters<ProjectPeriod>
							value={state.filter.period}
							items={items}
							defaultValue={'total' as ProjectPeriod}
							onChange={(value) => this._setPeriodFilter(form, value)}
							compact
						/>
					</div>
				)}
				{isMobileLayout ? (
					<div className={b('open-filters')}>
						<Button
							view="primary"
							size="small"
							text={t.showFilters}
							onClick={() => this.setState({showFilters: true})}
						/>
					</div>
				) : null}
				<FullnessWarning>
					{(onClick) => (
						<SizedItemsList limits={LIST_LIMITS} gutter={16}>
							{projects.map((project) => (
								<ContractorProjectCard project={project} onClick={onClick} openPage key={project._id} />
							))}
						</SizedItemsList>
					)}
				</FullnessWarning>
				<Pagination
					value={state.pagination?.currentPage}
					max={state.pagination?.pageCount}
					onChange={(page) => this._load({...state.filter, page})}
				/>
				<ConditionalRender
					if={(state) => isSearchAvailable(state.viewer)}
					else={<Warning warning>{t.searchUnavailableDisclaimer}</Warning>}
				>
					{projects.length === 0 ? (
						<div className={b('empty')}>
							{t.noProjectsDisclaimer}{' '}
							<LinkWrapper url="/faq/1">
								<div className={b('link')}>{t.learnMore}</div>
							</LinkWrapper>
						</div>
					) : null}
				</ConditionalRender>
				<Dialog isOpen={this.showDialog()} onClose={this._closeDialog} overlayClose showClose>
					{this._renderAdvices()}
				</Dialog>
			</div>
		);
	};

	private _renderAdvices = (): React.ReactNode => {
		const t = this.context.translates;
		return (
			<div className={b('congratulation-wrapper')}>
				<h2 className={b('congratulation-title')}>{t.projectSearchDialog?.[0]}</h2>
				<div className={b('congratulation-list-title')}>{t.projectSearchDialog?.[1]}</div>
				<ul className={b('congratulation-list')}>
					<li className={b('congratulation-list-item')}>{t.projectSearchDialog?.[2]}</li>
					<li className={b('congratulation-list-item')}>{t.projectSearchDialog?.[3]}</li>
					<li className={b('congratulation-list-item')}>{t.projectSearchDialog?.[4]}</li>
					<li className={b('congratulation-list-item')}>{t.projectSearchDialog?.[5]}</li>
					<li className={b('congratulation-list-item')}>{t.projectSearchDialog?.[6]}</li>
					<li className={b('congratulation-list-item')}>{t.projectSearchDialog?.[7]}</li>
				</ul>
			</div>
		);
	};

	render(): React.ReactNode {
		return (
			<div className={b()}>
				<Formik initialValues={this.state.filter} onSubmit={this._onSubmit} validationSchema={undefined}>
					{(form) => <FixedSideView side={this._renderFilters(form)}>{this._renderList(form)}</FixedSideView>}
				</Formik>
			</div>
		);
	}
}

export default connect(ProjectSearchPage);
