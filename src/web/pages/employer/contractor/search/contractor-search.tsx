import './contractor-search.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import * as Yup from 'yup';
import classname from '@/common/core/classname';
import FixedSideView from '@/web/views/fixed-side-view/fixed-side-view';
import PageTitle from '@/web/views/page-title/page-title';
import {FormikProps, withFormik} from 'formik';
import Label from '@/common/views/label/label';
import {SearchContractorInput, Viewer} from '@/common/types/user';
import {SpecialtyGroup} from '@/common/types/specialty';
import composeConnect from '@/common/core/compose/compose';
import AppState from '@/web/state/app-state';
import appActions from '@/web/actions/app-actions';
import {getSpecialtyTitle} from '@/web/utils/specialty-utils';
import Button from '@/common/views/button/button';
import Select, {SelectOptionsType} from '@/common/views/select/select';
import {getCitiesByName, searchContractor} from '@/web/actions/data-provider';
import ItemTextList from '@/web/views/item-text-list/item-text-list';
import Checkbox from '@/common/views/checkbox/checkbox';
import ErrorLabel from '@/common/views/error-label/error-label';
import SizedItemsList from '@/common/views/sized-items-list/sized-items-list';
import ContractorCard from '@/web/views/contractor-card/contractor-card';
import CountFilters from '@/web/views/count-filters/count-filters';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import SubscriptionBadge from '@/common/views/subscription-badge/subscription-badge';
import Hint from '@/common/views/hint/hint';
import IconInfo from '@/common/views/icon-info/icon-info';
import customEventConnect, {CustomEventProps} from '@/common/utils/custom-event-connect';
import FullnessWarning from '@/web/views/fullness-warning-view/fullness-warning-view';
import {withRouter, RouteComponentProps} from 'react-router';
import {updateSearch, parseSearch} from '@/common/utils/search-utils';
import {isPlainObject, pick, isEmpty} from 'lodash';
import notificationActions from '@/web/actions/notification-actions';
import SpecialtiesBadgeSelector from '@/web/views/specialties-badge-selector/specialties-badge-selector';
import ConditionalRender from '@/common/views/conditional-render/conditional-render';
import Warning from '@/common/views/warning/warning';
import {isSearchAvailable} from '@/web/utils/user-utils';
import {TranslatesContext} from '@/common/views/translates-provider/translates-provider';

import filtersIcon from '@/common/icons/filters.svg';

const mapDispatchToProps = {
	loadSpecialtyGroups: appActions.loadSpecialtyGroups,
	showNotification: notificationActions.showNotification
};

interface StateToProps {
	viewer?: Viewer;
	specialtyGroups: SpecialtyGroup[];
	isMobileLayout?: boolean;
}

type ReduxProps = StateToProps & typeof mapDispatchToProps;

interface SelfProps {}

type Props = SelfProps & ReduxProps & RouteComponentProps & CustomEventProps & FormikProps<SearchContractorInput>;

interface State {}

const connect = composeConnect<
	SelfProps & RouteComponentProps,
	ReduxProps,
	CustomEventProps,
	FormikProps<SearchContractorInput>
>(
	ReactRedux.connect(
		(state: AppState): StateToProps => ({
			viewer: state.viewer,
			specialtyGroups: state.specialtyGroups || [],
			isMobileLayout: state.isMobileLayout
		}),
		mapDispatchToProps
	),
	customEventConnect,
	withFormik({
		mapPropsToValues: () => {
			const parsed = parseSearch();
			const picked = pick(parsed, ['specialties', 'location', 'isPremium']);
			const filter = isPlainObject(picked) ? picked : undefined;
			return {
				...filter,
				specialties: filter?.specialties || []
			};
		},
		mapPropsToStatus: () => {
			const parsed = parseSearch();
			const picked = pick(parsed, ['specialties', 'location', 'isPremium']);
			return {
				filter: isPlainObject(picked) ? picked : undefined,
				isFirst: true
			};
		},
		validationSchema: Yup.object().shape({
			specialties: Yup.array().min(1, 'error')
		}),
		handleSubmit: (filter, bag) => {
			updateSearch(filter, bag.props.history);
			searchContractor({filter})
				.then((data) => {
					if (data) {
						bag.setStatus({showList: true, filter, data});
					}
				})
				.finally(() => {
					bag.setSubmitting(false);
				});
		}
	})
);

const b = classname('contractor-search-page');

class ContractorSearchPage extends React.PureComponent<Props, State> {
	static contextType = TranslatesContext;
	constructor(props: Props) {
		super(props);

		this.state = {};
	}

	componentDidMount() {
		const props = this.props;
		props.loadSpecialtyGroups();
		props.events.on('search', this._showFilters);
		const parsed = parseSearch();
		const picked = pick(parsed, ['specialties', 'location', 'isPremium']);
		if (!isEmpty(picked)) {
			this._changePage(parseInt(parsed.page) || 1);
		}
	}

	componentWillUnmount() {
		this.props.events.off('search', this._showFilters);
	}

	private _showFilters = (): void => {
		const props = this.props;
		props.setStatus({...props.status, showList: false});
	};

	private _onCityInputChange = (value: any): Promise<SelectOptionsType> => {
		return getCitiesByName((value || '').slice(0, 50)).then((cities) => {
			return cities.map((city) => {
				return {
					value: city._id,
					label: city.localeFullName,
					shortLabel: city.localeName
				};
			});
		});
	};

	private _changePage = (page: number): void => {
		const props = this.props;
		const filter = props.status?.filter;
		props.setSubmitting(true);
		updateSearch({...filter, page}, props.history);
		searchContractor({filter, page})
			.then((data) => {
				props.setStatus({showList: true, filter, data});
			})
			.finally(() => {
				props.setSubmitting(false);
			});
	};

	private _renderFiltersSide = (): React.ReactNode => {
		const props = this.props;
		const t = this.context.translates;
		if (props.isMobileLayout && props.status.showList) {
			return null;
		}
		return (
			<div className={b('filters-side')}>
				<PageTitle red>{t['findContractor']}</PageTitle>
				<Label text={t['whoAreYouLooking']} />
				<SpecialtiesBadgeSelector
					groups={props.specialtyGroups}
					values={props.values.specialties}
					onChange={(specialties) => props.setFieldValue('specialties', specialties)}
				/>
				<ItemTextList
					items={props.values.specialties}
					getTitle={(specialtyId) => getSpecialtyTitle(this.props.specialtyGroups, specialtyId)}
					onRemove={(specialties) => props.setFieldValue('specialties', specialties)}
				/>
				<ErrorLabel>
					{props.touched.specialties && props.errors.specialties ? t.chooseSpeciality : null}
				</ErrorLabel>
				<Label
					text={
						<>
							{t.location}
							<Hint position="top" content={t['contractorLocationHint']}>
								<IconInfo margin />
							</Hint>
						</>
					}
				/>
				<Select
					name="location"
					value={props.values.location}
					onChange={(data) => props.setFieldValue('location', data?.value)}
					placeholder={t['nameOfTheCity']}
					onInputChange={this._onCityInputChange}
					isClearable
				/>
				<div className={b('only-premium')}>
					<Checkbox name="isPremium" value={props.values.isPremium} setFieldValue={props.setFieldValue}>
						{t['only']} <SubscriptionBadge premium />
					</Checkbox>
				</div>
				<div className={b('submit')}>
					<FullnessWarning>
						{(onClick) => (
							<Button
								text={t['search']}
								onClick={onClick || props.submitForm}
								minWidth
								disabled={!isSearchAvailable(props.viewer)}
							/>
						)}
					</FullnessWarning>
				</div>
			</div>
		);
	};

	private _renderList = (): React.ReactNode => {
		const props = this.props;
		const t = this.context.translates;
		const status = props.status || {};
		const users = status.data?.items || [];
		if (props.isMobileLayout && !props.status.showList) {
			return null;
		}
		return (
			<div className={b('list')}>
				{users.length > 0 ? (
					<div className={b('count')}>
						<CountFilters
							value="total"
							items={[{title: t['contractors'], value: 'total', count: status.data?.count}]}
						/>
						{props.isMobileLayout ? (
							<div
								className={b('filters-icon')}
								onClick={() => props.setStatus({...status, showList: false})}
							>
								<SvgIcon url={filtersIcon} width={16} height={16} />
							</div>
						) : null}
					</div>
				) : null}
				<SizedItemsList
					gutter={16}
					pageInfo={status.data?.pageInfo}
					onPageChange={(page) => this._changePage(page)}
				>
					{users.map((user) => (
						<ContractorCard
							user={user}
							specialties={status.filter?.specialties}
							openPage
							showFavorite
							key={user.username}
						/>
					))}
				</SizedItemsList>
				<ConditionalRender
					if={(state) => isSearchAvailable(state.viewer)}
					else={<Warning warning>{t['contractorSearchWarning']}</Warning>}
				>
					<>
						{!props.isSubmitting && users.length === 0 && !status.isFirst ? (
							<div className={b('empty')}>
								{t['contractorSearchUnsuccessful']}
								{props.isMobileLayout ? (
									<Button
										view="invisible"
										text={t['back']}
										onClick={() => props.setStatus({...status, showList: false})}
									/>
								) : null}
							</div>
						) : null}
						{status.isFirst ? (
							<div className={b('disclaimer')}>
								<b>{t.contractorSearchFishText?.[0]}</b>
								<p>{t.contractorSearchFishText?.[1]}</p>
								<p> {t.contractorSearchFishText?.[2]}</p>
								<p>{t.contractorSearchFishText?.[3]}</p>
								<p>{t.contractorSearchFishText?.[4]}</p>
								<p>{t.contractorSearchFishText?.[5]}</p>
							</div>
						) : null}
					</>
				</ConditionalRender>
			</div>
		);
	};

	render(): React.ReactNode {
		return (
			<div className={b()}>
				<FixedSideView side={this._renderFiltersSide()}>{this._renderList()}</FixedSideView>
			</div>
		);
	}
}

export default withRouter(connect(ContractorSearchPage));
