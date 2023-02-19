import './project-add.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import * as Yup from 'yup';
import Label from '@/common/views/label/label';
import BadgeSelector from '@/common/views/badge-selector/badge-selector';
import {
	CreateProject,
	MyProjectsCount,
	PaycheckType,
	Project,
	ProjectPeriod,
	ProjectReference,
	ProjectType,
	ProjectStatus
} from '@/common/types/project';
import AppState from '@/web/state/app-state';
import appActions from '@/web/actions/app-actions';
import {Formik, FormikHelpers, FormikProps} from 'formik';
import Input from '@/common/views/input/input';
import Textarea from '@/common/views/textarea/textarea';
import Card from '@/common/views/card/card';
import DragAndDropFile from '@/common/views/drag-and-drop-file/drag-and-drop-file';
import Button from '@/common/views/button/button';
import Checkbox from '@/common/views/checkbox/checkbox';
import DatePicker from '@/common/views/datepicker/datepicker';
import Select, {SelectOptionsType} from '@/common/views/select/select';
import {
	createProject,
	getCitiesByName,
	getMyProjects,
	getMyProjectsCount,
	getProject,
	saveProject,
	publishProject,
	sendMetrics
} from '@/web/actions/data-provider';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import {SpecialtyGroup} from '@/common/types/specialty';
import {getSpecialty, getSpecialtyTitle} from '@/web/utils/specialty-utils';
import Dialog from '@/common/views/dialog/dialog';
import ErrorLabel from '@/common/views/error-label/error-label';
import {getPaycheckOptions, getProjectTypeTitle} from '@/web/utils/project-utils';
import asyncAction, {AsyncAction} from '@/common/core/async-action/async-action';
import {RouteComponentProps, withRouter} from 'react-router';
import composeConnect from '@/common/core/compose/compose';
import EmployerProjectCard from '@/web/views/employer-project-card/employer-project-card';
import FixedSideView from '@/web/views/fixed-side-view/fixed-side-view';
import PageTitle from '@/web/views/page-title/page-title';
import ProjectView from '@/web/views/project-view/project-view';
import upload from '@/web/utils/upload/upload';
import Preloader from '@/common/views/preloader/preloader';
import SizedItemsList from '@/common/views/sized-items-list/sized-items-list';
import ItemTextList from '@/web/views/item-text-list/item-text-list';
import config from '@/web/config';
import SubscriptionBadge from '@/common/views/subscription-badge/subscription-badge';
import IconInfo from '@/common/views/icon-info/icon-info';
import Hint from '@/common/views/hint/hint';
import notificationActions from '@/web/actions/notification-actions';
import Uploader from '@/common/views/uploader/uploader';
import UploadList from '@/common/views/upload-list/upload-list';
import {URL_REGEXP} from '@/web/utils/user-utils';
import {isEqual, merge} from 'lodash-es';
import {hasErrorCode} from '@/common/core/apollo-client/errors';
import {City, Viewer} from '@/common/types/user';
import FullnessWarning from '@/web/views/fullness-warning-view/fullness-warning-view';
import SpecialtiesBadgeSelector from '@/web/views/specialties-badge-selector/specialties-badge-selector';
import CountFilters, {CountItem} from '@/web/views/count-filters/count-filters';
import {TranslatesContext} from '@/common/views/translates-provider/translates-provider';

import closeIcon from '@/common/icons/close.svg';
import {getLocaleCurrency} from '@/web/utils/price-utils';

const DAY = 24 * 60 * 60 * 1000;
const MIN_END_DATE = 7 * DAY;

const devInitialValues: CreateProject = {
	type: 'full',
	title: 'Glass',
	description: 'short description',
	attachment: undefined,

	specialties: [],
	// location: '',
	onlyPremium: true,

	period: ProjectPeriod.BEFORE,
	projectDate: Math.floor((Number(new Date()) + MIN_END_DATE) / DAY) * DAY,
	endDate: 14 * DAY,
	// hot: true,
	nonCommercial: false,
	budget: 10,
	paycheck: {
		type: PaycheckType.SHIFT,
		amount: 10,
		overtime: 1
	},

	references: [{description: 'yo', example: 'https://asmoth.me'}],
	test: {
		description: 'halleluja',
		file: undefined
	}
};

const initialValues: CreateProject = config.dev
	? devInitialValues
	: {
			type: 'full',
			title: '',
			description: '',
			attachment: undefined,

			specialties: [],
			location: undefined,
			onlyPremium: false,

			period: ProjectPeriod.BEFORE,
			projectDate: new Date().getTime(),
			endDate: Math.floor((Number(new Date()) + MIN_END_DATE) / DAY) * DAY,
			// hot: false,
			nonCommercial: false,
			budget: 0,
			paycheck: {
				type: PaycheckType.SHIFT,
				amount: 0,
				overtime: 0
			},

			references: [],
			test: {
				description: '',
				file: undefined
			}
	  };

const referencesInitialValues: ProjectReference = {
	description: '',
	example: ''
};

const referencesValidation = Yup.object()
	.shape({
		description: Yup.string().required('required'),
		example: Yup.string().matches(URL_REGEXP, 'invalid'),
		upload: Yup.object()
	})
	.test('exampleAndUpload', 'invalidLinkOrFile', function (value) {
		return !value?.example && !value?.upload
			? this.createError({
					path: !value?.example ? 'example' : 'upload',
					message: 'invalidLinkOrFile'
			  })
			: false;
	});

const validationStepOne = Yup.object().shape({
	title: Yup.string().required('required'),
	description: Yup.string().required('required')
});

const validationStepTwo = Yup.object().shape({
	specialties: Yup.array().min(1, 'min')
});

const mapDispatchToProps = {
	loadProjectTypes: appActions.loadProjectTypes,
	loadSpecialtyGroups: appActions.loadSpecialtyGroups,
	showNotification: notificationActions.showNotification,
	updateViewer: appActions.updateViewer
};

interface StateToProps {
	viewer: Viewer;
	projectTypes: ProjectType[];
	specialtyGroups: SpecialtyGroup[];
	isMobileLayout?: boolean;
}

type ReduxProps = StateToProps & typeof mapDispatchToProps;

interface SelfProps {
	hideList?: boolean;
}

type RouteProps = RouteComponentProps<{id?: string}>;

type Props = SelfProps & ReduxProps & RouteProps;

interface State {
	step: number;
	uploading?: boolean;
	showReferencesDialog: boolean;
	showSubscriptionDialog: boolean;
	project?: Project;
	projects: Project[];
	status: ProjectStatus;
	count: MyProjectsCount;
	showCreate: boolean;
	initialValues: CreateProject;
	locationsOptions?: SelectOptionsType;
	publish?: boolean;
	showCongratulationDialog: boolean;
}

const connect = composeConnect<SelfProps, ReduxProps, RouteProps>(
	ReactRedux.connect(
		(state: AppState): StateToProps => ({
			viewer: state.viewer!,
			projectTypes: state.projectTypes || [],
			specialtyGroups: state.specialtyGroups || [],
			isMobileLayout: state.isMobileLayout
		}),
		mapDispatchToProps
	),
	withRouter
);

const b = classname('project-add-page');

const STEPS_SHOW = 4;
const STEPS_LIMIT = 5;

class ProjectAddPage extends React.PureComponent<Props, State> {
	private _loadProjectsAction?: AsyncAction;
	static contextType = TranslatesContext;

	constructor(props: Props) {
		super(props);

		this.state = {
			step: 1,
			showReferencesDialog: false,
			showSubscriptionDialog: false,
			showCongratulationDialog: false,
			projects: [],
			status: 'active',
			count: {
				active: 0,
				draft: 0,
				archived: 0
			},
			initialValues,
			showCreate: Boolean(props.match.params.id)
		};
	}

	componentDidMount() {
		const props = this.props;
		props.loadProjectTypes();
		props.loadSpecialtyGroups();
		this._loadProjects();
		this._loadProject();
		const savedProject = this._getSavedProject();
		if (!props.match.params.id && savedProject && !isEqual(savedProject, initialValues)) {
			this.setState({initialValues: savedProject});
			localStorage.removeItem('create-project');
		}
	}

	componentDidUpdate(_props: Props, state: State) {
		if (this.state.status !== state.status) {
			this._loadProjects();
		}
		if (this.state.step !== state.step) {
			window.scroll(0, 0);
		}
	}

	private _loadProject = (): void => {
		const id = this.props.match.params.id;
		if (id) {
			getProject(id).then((project) => {
				if (project) {
					this.setState({project, initialValues: convertProjectToProjectInput(project)});
					const location = project.location;
					if (location?.localeName) {
						this._onCityInputChange(location.localeName).then((locationsOptions) => {
							this.setState({locationsOptions});
						});
					}
				}
			});
		}
	};

	private _nextStep = (props: FormikProps<CreateProject>): void => {
		props.validateForm().then((results) => {
			const errorKeys = Object.keys(results);
			if (errorKeys.length === 0) {
				this.setState({
					step: Math.min(this.state.step + 1, STEPS_LIMIT)
				});
			} else {
				errorKeys.forEach((field) => {
					props.setFieldTouched(field, true, true);
				});
			}
		});
	};

	private _prevStep = (): void => {
		this.setState({
			step: Math.max(this.state.step - 1, 1)
		});
	};

	private _onSubmit = (values: CreateProject, {setSubmitting}: FormikHelpers<CreateProject>): void => {
		const props = this.props;
		const id = props.match.params.id;
		const input = {
			...values,
			budget: values.budget || 0,
			paycheck: {
				...values.paycheck,
				amount: values.paycheck.amount || 0,
				overtime: values.paycheck.overtime || 0
			}
		};
		const request = id ? saveProject({id, input}) : createProject({input});
		request
			.then((project) => {
				if (project && this.state.publish) {
					return publishProject({id: project._id});
				}
				return project;
			})
			.then((project) => {
				if (project) {
					localStorage.removeItem('create-project');
					props.history.push({
						pathname: '/projects',
						state: {force: true}
					});
				}
			})
			.catch((error) => {
				if (hasErrorCode(error, 'QUOTA_EXCEEDED')) {
					this.setState({showSubscriptionDialog: true});
				}
			})
			.finally(() => {
				setSubmitting(false);
			});
	};

	private _onReferenceSubmit = (projectProps: FormikProps<CreateProject>, values: ProjectReference): void => {
		const references = projectProps.values.references.concat([values]);
		projectProps.setFieldValue('references', references);
		this.setState({showReferencesDialog: false});
	};

	private _getValidationSchema = (): any => {
		const step = this.state.step;
		if (step === 1) {
			return validationStepOne;
		}
		if (step === 2) {
			return validationStepTwo;
		}
		return;
	};

	private _onFileChange = (form: FormikProps<CreateProject>, attachment?: File): void => {
		if (attachment) {
			this.setState({uploading: true});
			upload('document', attachment).then((upload) => {
				if (upload) {
					form.setFieldValue('attachment', upload);
				}
				this.setState({uploading: false});
			});
		}
	};

	private _loadProjects = (): void => {
		asyncAction.cancel(this._loadProjectsAction);

		this._loadProjectsAction = asyncAction.create(
			Promise.all([getMyProjects(this.state.status), getMyProjectsCount()]),
			{
				success: ([projects, count]) => this.setState({projects, count})
			}
		);
	};

	private _parseCitiesOptions = (cities: City[]): SelectOptionsType => {
		return cities.map((city) => {
			return {
				value: city._id,
				label: city.localeFullName,
				shortLabel: city.localeName
			};
		});
	};

	private _onCityInputChange = (value: any): Promise<SelectOptionsType> => {
		return getCitiesByName((value || '').slice(0, 50)).then((cities) => {
			const locationsOptions = this._parseCitiesOptions(cities);
			this.setState({locationsOptions});
			return locationsOptions;
		});
	};

	private _getSavedProject = (): CreateProject | undefined => {
		let savedProject: CreateProject | undefined;
		try {
			const data = JSON.parse(localStorage.getItem('create-project') || '');
			savedProject = merge({}, initialValues, data);
		} catch (e) {
			savedProject = undefined;
		}
		return savedProject;
	};

	private _tryToRememberProject = (project: CreateProject): void => {
		const savedProject = this._getSavedProject();
		if (
			project.title &&
			project.title.length > 4 &&
			(!savedProject ||
				savedProject.title.startsWith(project.title) ||
				project.title.startsWith(savedProject.title))
		) {
			localStorage.setItem('create-project', JSON.stringify(project));
		}
	};

	private _publishProject = (form: FormikProps<CreateProject>): void => {
		const isFirstPublishedProject = this.props.viewer.modals?.isFirstPublishedProject;
		if (isFirstPublishedProject) {
			this.setState({publish: true}, () => {
				form.handleSubmit();
			});
		} else {
			this.setState({showCongratulationDialog: true});
		}
	};

	private _onCloseDialog = (form) => {
		sendMetrics({type: 'modals_isFirstPublishedProject', data: true}).then(() => {
			this.props.updateViewer({
				...this.props.viewer,
				modals: {...this.props.viewer.modals, isFirstPublishedProject: true}
			});
			this.setState({publish: true}, () => {
				form.handleSubmit();
			});
		});
	};

	private _renderFileDrop = (form: FormikProps<CreateProject>): React.ReactNode => {
		const state = this.state;
		const t = this.context.translates;
		return (
			<DragAndDropFile onChange={(file) => this._onFileChange(form, file)}>
				{({onClick, isDragover}) => (
					<UploadList
						uploads={form.values.attachment ? [form.values.attachment] : []}
						onRemove={() => form.setFieldValue('attachment', undefined, true)}
					>
						<Card className={b('upload', {dragover: isDragover})} view="light" rounded="small">
							<div>{t.uploadFile?.[0]}</div>
							<div>*.doc, *.pdf, *.jpg, *.png</div>
							<div className={b('or')}>{t.uploadFile?.[1]}</div>
							<div className={b('select-file')} onClick={onClick}>
								{t.uploadFile?.[2]} {this.props.isMobileLayout ? t.uploadFile?.[3] : t.uploadFile?.[4]}
							</div>
							{state.uploading ? <Preloader overlay /> : null}
						</Card>
					</UploadList>
				)}
			</DragAndDropFile>
		);
	};

	private _renderReferencesDialogContent = (projectProps: FormikProps<CreateProject>): React.ReactNode => {
		const t = this.context.translates;
		return (
			<div className={b('references-dialog')}>
				<Formik
					initialValues={referencesInitialValues}
					onSubmit={(values) => this._onReferenceSubmit(projectProps, values)}
					validationSchema={referencesValidation}
				>
					{(form) => (
						<>
							<Label text={t['nameOfTheProperty']} />
							<Input
								name="description"
								size="small"
								placeholder={t['referencesDialogFirstPlaceholder']}
								value={form.values.description}
								disabled={form.isSubmitting}
								onChange={form.handleChange}
								onBlur={form.handleBlur}
								error={
									form.touched.description && form.errors.description && t.errors.invalidDescription
								}
							/>
							<Label text={t['link']} />
							<Input
								name="example"
								size="small"
								placeholder={t['referencesDialogSecondPlaceholder']}
								value={form.values.example}
								disabled={form.isSubmitting || Boolean(form.values.upload)}
								onChange={form.handleChange}
								onBlur={form.handleBlur}
							/>
							<Label text={t['or']} />
							<Uploader accept="document" onChange={(upload) => form.setFieldValue('upload', upload)}>
								{({onClick, uploading}) => (
									<>
										<UploadList
											uploads={form.values.upload ? [form.values.upload] : []}
											onRemove={(uploads) => form.setFieldValue('upload', uploads[0], true)}
										>
											<Button
												text={t['uploadFileSingle']}
												disabled={uploading || Boolean(form.values.example)}
												onClick={onClick}
											/>
										</UploadList>
										{uploading ? <Preloader overlay /> : null}
									</>
								)}
							</Uploader>
							<ErrorLabel>
								{(form.touched.example || form.touched.upload) &&
									(form.errors.example || form.errors.upload) &&
									t.errors.invalidLinkOrFile}
							</ErrorLabel>
							<div className={b('reference-buttons')}>
								<Button
									type="submit"
									text={t['add']}
									disabled={!form.dirty || (form.dirty && !form.isValid)}
									onClick={form.handleSubmit}
								/>
							</div>
						</>
					)}
				</Formik>
			</div>
		);
	};

	private _renderStepOne = (props: FormikProps<CreateProject>): React.ReactNode => {
		const t = this.context.translates;
		return (
			<>
				<Label text={t['projectType']} />
				<BadgeSelector
					name="type"
					view="gray"
					size="small"
					value={props.values.type}
					getValue={(type) => type.id}
					items={this.props.projectTypes}
					onChange={props.setFieldValue}
				/>
				<Label text={t['title']} />
				<Input
					name="title"
					size="small"
					value={props.values.title}
					disabled={props.isSubmitting}
					onChange={props.handleChange}
					onBlur={props.handleBlur}
					error={props.touched.title && props.errors.title && t.errors.invalidTitle}
				/>
				<Label text={t['describe']} />
				<Textarea
					name="description"
					size="small"
					rows={5}
					value={props.values.description}
					disabled={props.isSubmitting}
					onChange={props.handleChange}
					onBlur={props.handleBlur}
					maxlength={1000}
					error={props.touched.description && props.errors.description && t.errors.invalidDescription}
				/>
				<Label>
					{t['projectFile']}{' '}
					<Hint position="right" content={t['projectFileHint']}>
						<IconInfo />
					</Hint>
				</Label>
				{this._renderFileDrop(props)}
			</>
		);
	};

	private _renderStepTwo = (form: FormikProps<CreateProject>): React.ReactNode => {
		const t = this.context.translates;
		const lang = this.context.lang;
		const periodOptions = Object.values(ProjectPeriod).map((value) => ({
			value,
			label: t.projectPeriodLabels[value] || ''
		}));
		return (
			<div className={b('two')}>
				<Label text={t['whoAreYouLooking']} />
				<SpecialtiesBadgeSelector
					groups={this.props.specialtyGroups}
					values={form.values.specialties}
					onChange={(specialties) => form.setFieldValue('specialties', specialties)}
				/>
				<ErrorLabel>
					{form.touched.specialties && form.errors.specialties && t.errors.invalidSpecialties}
				</ErrorLabel>
				<ItemTextList
					items={form.values.specialties}
					getTitle={(specialtyId) => getSpecialtyTitle(this.props.specialtyGroups, specialtyId, lang)}
					onRemove={(specialties) => form.setFieldValue('specialties', specialties)}
				/>
				<Label text={t['employmentPeriod']} />
				<Select
					value={form.values.period}
					options={periodOptions}
					onChange={(option) => option && form.setFieldValue('period', option.value)}
				/>
				<Label text={t.location} />
				<Select
					name="location"
					value={form.values.location}
					options={this.state.locationsOptions}
					onChange={(data) => form.setFieldValue('location', data?.value)}
					placeholder={t['nameOfTheCity']}
					onInputChange={this._onCityInputChange}
					isClearable
				/>
				<div className={b('only-premium')}>
					<Checkbox name="onlyPremium" value={form.values.onlyPremium} setFieldValue={form.setFieldValue}>
						{t['only']} <SubscriptionBadge premium />
					</Checkbox>
				</div>
			</div>
		);
	};

	private _renderStepThree = (props: FormikProps<CreateProject>): React.ReactNode => {
		const days7 = 7 * DAY;
		const days14 = 14 * DAY;
		const t = this.context.translates;
		const lang = this.context.lang;
		return (
			<div className={b('three')}>
				<Label>
					{t['shootingDate']}{' '}
					<Hint position="right" content={t['shootingDateHint']}>
						<IconInfo size="small" />
					</Hint>
				</Label>
				<div className={b('end-date')}>
					<DatePicker
						name="projectDate"
						value={props.values.projectDate}
						setFieldValue={props.setFieldValue}
					/>
				</div>
				<Label>
					{t['relevanceRequest']}{' '}
					<Hint position="right" content={t['relevanceRequestHint']}>
						<IconInfo size="small" />
					</Hint>
				</Label>
				<div className={b('end-date-buttons')}>
					<Button
						view={props.values.endDate == days7 ? 'primary' : 'secondary'}
						size="small"
						text={t['7days']}
						onClick={() => props.setFieldValue('endDate', days7)}
					/>
					<Button
						view={props.values.endDate == days14 ? 'primary' : 'secondary'}
						size="small"
						text={t['14days']}
						onClick={() => props.setFieldValue('endDate', days14)}
					/>
					<Button
						view={!props.values.endDate ? 'primary' : 'secondary'}
						size="small"
						text={t['termless']}
						onClick={() => {
							props.setFieldValue('endDate', undefined);
							props.setFieldValue('budget', 0);
							props.setFieldValue('paycheck.type', PaycheckType.MONTH);
						}}
					/>
				</div>
				<Checkbox
					name="nonCommercial"
					value={props.values.nonCommercial}
					setFieldValue={(name, value) => {
						props.setFieldValue('budget', 0, false);
						props.setFieldValue('paycheck.amount', 0, false);
						props.setFieldValue('paycheck.overtime', 0, false);
						props.setFieldValue(name, value);
					}}
				>
					{t['nonComercial']}{' '}
					<Hint position="right" content={t['nonCommercialHint']}>
						<IconInfo size="small" />
					</Hint>
				</Checkbox>
				<Label className={b('budget')} text={`${t['projectBudget']} (${getLocaleCurrency(lang)})`} />
				<Input
					name="budget"
					type="number"
					size="small"
					value={props.values.budget}
					disabled={!props.values.endDate || props.values.nonCommercial || props.isSubmitting}
					onChange={props.handleChange}
					onBlur={props.handleBlur}
					error={props.touched.budget && props.errors.budget}
				/>
				<Label text={t['paymentPeriod']} />
				<BadgeSelector
					name="paycheck.type"
					value={props.values.paycheck.type}
					disabled={props.values.nonCommercial || props.isSubmitting}
					items={getPaycheckOptions(!props.values.endDate ? PaycheckType.MONTH : undefined, lang)}
					onChange={props.setFieldValue}
				/>
				<div className={b('payment')}>
					<div>
						<Label text={`${t['payment']} (${getLocaleCurrency(lang)})`} />
						<Input
							name="paycheck.amount"
							type="number"
							size="small"
							value={props.values.paycheck.amount}
							disabled={props.values.nonCommercial || props.isSubmitting}
							min={0}
							onChange={props.handleChange}
							onBlur={props.handleBlur}
							error={props.touched.paycheck?.amount && props.errors.paycheck?.amount}
						/>
					</div>
					<div>
						<Label text={`${t['paymentForOvertime']} (${getLocaleCurrency(lang)}/${t.hour})`} />
						<Input
							name="paycheck.overtime"
							type="number"
							size="small"
							value={props.values.paycheck.overtime}
							disabled={props.values.nonCommercial || props.isSubmitting}
							min={0}
							onChange={props.handleChange}
							onBlur={props.handleBlur}
							error={props.touched.paycheck?.overtime && props.errors.paycheck?.overtime}
						/>
					</div>
				</div>
				<Label text={t['paymentComment']} />
				<Textarea
					name="paycheck.comment"
					size="small"
					rows={2}
					value={props.values.paycheck.comment}
					disabled={props.isSubmitting}
					onChange={props.handleChange}
					maxlength={500}
					onBlur={props.handleBlur}
				/>
			</div>
		);
	};

	private _renderReferencesList = (props: FormikProps<CreateProject>, close?: boolean): React.ReactNode => {
		const t = this.context.translates;
		return (
			<div className={b('references-list')}>
				{props.values.references.map((reference) => (
					<div className={b('reference')} key={reference.example || reference.upload?._id}>
						<div className={b('reference-description')}>
							{reference.description}
							<a
								className={b('reference-link')}
								href={reference.example || reference.upload?.url}
								target="_blank"
								rel="noreferrer"
							>
								{t['link']}
							</a>
						</div>
						{close ? (
							<div
								className={b('reference-remove')}
								onClick={() =>
									props.setFieldValue(
										'references',
										props.values.references.filter((item) => item !== reference)
									)
								}
							>
								<SvgIcon url={closeIcon} width={16} height={16} />
							</div>
						) : null}
					</div>
				))}
			</div>
		);
	};

	private _renderStepFour = (props: FormikProps<CreateProject>): React.ReactNode => {
		const t = this.context.translates;
		return (
			<div className={b('four')}>
				<Label>
					{t['references']}{' '}
					<Hint position="right" content={t['referencesHint']}>
						<IconInfo />
					</Hint>
				</Label>
				{this._renderReferencesList(props, true)}
				<div className={b('references-button')}>
					<Dialog
						isOpen={this.state.showReferencesDialog}
						onClose={() => this.setState({showReferencesDialog: false})}
						showClose
					>
						{this._renderReferencesDialogContent(props)}
					</Dialog>
					<Button
						view="bordered"
						text={t['addReference']}
						onClick={() => this.setState({showReferencesDialog: true})}
					/>
				</div>
				<Label className={b('test-label')} text={t['test']} />
				<Textarea
					name="test.description"
					size="small"
					rows={5}
					value={props.values.test.description}
					disabled={Boolean(props.values.test.file) || props.isSubmitting}
					maxlength={300}
					onChange={props.handleChange}
					onBlur={props.handleBlur}
				/>
				<div className={b('test-button')}>
					<div className={b('test-or')}>{t['or']}</div>
					<Uploader onChange={(upload) => props.setFieldValue('test.file', upload)}>
						{({onClick, uploading}) => (
							<UploadList
								uploads={props.values.test.file ? [props.values.test.file] : []}
								onRemove={() => props.setFieldValue('test.file', undefined, true)}
							>
								<Button
									view="bordered"
									text={t['uploadFileSingle']}
									disabled={
										uploading ||
										Boolean(props.values.test.description?.replace(/\s/, '')) ||
										props.isSubmitting
									}
									onClick={onClick}
								/>
							</UploadList>
						)}
					</Uploader>
				</div>
				{this.state.uploading ? <Preloader overlay /> : null}
			</div>
		);
	};

	private _renderSteps = (props: FormikProps<CreateProject>): React.ReactNode => {
		const step = this.state.step;
		return (
			<>
				<div className={b('step-content')}>
					{step === 1 ? this._renderStepOne(props) : null}
					{step === 2 ? this._renderStepTwo(props) : null}
					{step === 3 ? this._renderStepThree(props) : null}
					{step === 4 ? this._renderStepFour(props) : null}
				</div>
				{this._renderStepControls(props)}
			</>
		);
	};

	private _renderStepControls = (form: FormikProps<CreateProject>): React.ReactNode => {
		const state = this.state;
		const step = state.step;
		const t = this.context.translates;
		return (
			<>
				<div className={b('controls')}>
					{step > 1 ? (
						<div>
							<Button view="secondary" text={t['back']} onClick={this._prevStep} stretched />
						</div>
					) : null}
					{this.props.isMobileLayout && step === 1 ? (
						<div>
							<Button
								view="secondary"
								text={t['cancel']}
								onClick={() => this.setState({showCreate: false})}
								stretched
							/>
						</div>
					) : null}
					<div>
						<Button
							text={step === STEPS_LIMIT ? t['preview'] : t['next']}
							disabled={state.uploading}
							onClick={() => this._nextStep(form)}
							stretched
						/>
					</div>
				</div>
				<div className={b('steps')}>
					<b>{step}</b>/{STEPS_SHOW}
				</div>
			</>
		);
	};

	private _renderCreate = (form: FormikProps<CreateProject>): React.ReactNode => {
		const state = this.state;
		const step = state.step;
		const t = this.context.translates;
		if (this.props.isMobileLayout && !state.showCreate) {
			return null;
		}

		if (!this.props.match.params.id) {
			this._tryToRememberProject(form.values);
		}
		return (
			<div className={b('create')}>
				<PageTitle red>
					{this.props.match.params.id ? t['projectEditing'] : t['creatingNewProject']}{' '}
					<Hint position="right" content={t['createHint']}>
						<IconInfo />
					</Hint>
				</PageTitle>
				<div className={b('content')}>{step <= STEPS_SHOW ? this._renderSteps(form) : null}</div>
			</div>
		);
	};

	private _renderList = (): React.ReactNode => {
		const props = this.props;
		const state = this.state;
		const projects = state.projects;
		const status = state.status;
		const t = this.context.translates;
		if ((props.isMobileLayout && state.showCreate) || props.hideList) {
			return null;
		}

		const COUNT_OPTIONS: CountItem<ProjectStatus>[] = [
			{title: t['active'], value: 'active'},
			{title: t['drafts'], value: 'draft'},
			{title: t['archived'], value: 'archived'}
		];

		const filterItems = COUNT_OPTIONS.map((item) => ({...item, count: state.count?.[item.value]}));
		return (
			<>
				<div className={b('header')}>
					<CountFilters<ProjectStatus>
						value={status}
						items={filterItems}
						onChange={(status) => this.setState({status})}
					/>
				</div>
				{props.isMobileLayout ? (
					<div className={b('open-create')}>
						<Button text={t['createProject']} onClick={() => this.setState({showCreate: true})} />
					</div>
				) : null}
				<div className={b('list')}>
					<SizedItemsList gutter={16}>
						{projects.map((project) => (
							<EmployerProjectCard
								project={project}
								onClick={() => props.history.push(`/project/${project._id}`)}
								key={project._id}
							/>
						))}
					</SizedItemsList>
					{projects.length === 0 ? <div className={b('empty')}>{t['employerMyProjectsFishText']}</div> : null}
				</div>
			</>
		);
	};

	private _renderPreview = (form: FormikProps<CreateProject>): React.ReactNode => {
		const props = this.props;
		const project = convertProjectInputToProject(props, form.values, this.context.lang);
		const id = props.match.params.id;
		const t = this.context.translates;
		return (
			<div className={b('preview')}>
				<PageTitle>{t['yourNewProject']}</PageTitle>
				<ProjectView project={project} />
				<div className={b('preview-buttons')}>
					<Button view="secondary" text={t['back']} disabled={form.isSubmitting} onClick={this._prevStep} />
					<Button
						type="submit"
						text={id ? t['save'] : t['saveToDraft']}
						disabled={form.isSubmitting}
						onClick={form.handleSubmit}
					/>
					{!id || this.state.project?.status === 'draft' ? (
						<Button
							type="submit"
							text={t['publish']}
							disabled={form.isSubmitting}
							onClick={() => {
								this._publishProject(form);
							}}
						/>
					) : null}
				</div>
				<Dialog
					isOpen={this.state.showSubscriptionDialog}
					onClose={() => this.setState({showSubscriptionDialog: false})}
					overlayClose
					showClose
				>
					<div className={b('subscription-dialog')}>
						<PageTitle>{t['publicationRejected']}</PageTitle>
						<div className={b('dialog-text')}>{t['publicationRejectedDescribe']}</div>
						<div className={b('dialog-button')}>
							<Button text={t.buttons.open} url="/subscription" />
						</div>
					</div>
				</Dialog>
				<Dialog
					isOpen={this.state.showCongratulationDialog}
					onClose={() => this._onCloseDialog(form)}
					showClose
				>
					{this._renderCongratulations(form)}
				</Dialog>
			</div>
		);
	};

	private _renderCongratulations = (form: FormikProps<CreateProject>): React.ReactNode => {
		const t = this.context.translates;
		return (
			<div className={b('congratulation__wrapper')}>
				<h2 className={b('congratulation__title')}>{t.projectAddCongratulation?.[0]}</h2>
				<div className={b('congratulation__list-title')}>{t.projectAddCongratulation?.[1]}</div>
				<ul className={b('congratulation__list')}>
					<li className={b('congratulation__list__item')}>{t.projectAddCongratulation?.[2]}</li>
					<li className={b('congratulation__list__item')}>{t.projectAddCongratulation?.[3]} </li>
					<li className={b('congratulation__list__item')}>{t.projectAddCongratulation?.[4]} </li>
					<li className={b('congratulation__list__item')}>{t.projectAddCongratulation?.[5]}</li>
					<li className={b('congratulation__list__item')}>{t.projectAddCongratulation?.[6]}</li>
				</ul>
				<Button
					className={b('congratulation__button')}
					text={t['continue']}
					onClick={() => this._onCloseDialog(form)}
				/>
			</div>
		);
	};

	render(): React.ReactNode {
		const state = this.state;
		const step = state.step;
		return (
			<div className={b()}>
				<FullnessWarning initialShow />
				<Formik
					initialValues={state.initialValues}
					onSubmit={this._onSubmit}
					validationSchema={this._getValidationSchema()}
					enableReinitialize
				>
					{(form) =>
						step <= STEPS_SHOW ? (
							<FixedSideView side={this._renderCreate(form)}>{this._renderList()}</FixedSideView>
						) : (
							this._renderPreview(form)
						)
					}
				</Formik>
			</div>
		);
	}
}

function convertProjectInputToProject(props: Props, input: CreateProject, lang: string): Project {
	return {
		...input,
		_id: '',
		author: props.viewer,
		type: {
			id: input.type,
			title: getProjectTypeTitle(props.projectTypes, input.type)
		},
		hot: false,
		attachment: input.attachment,
		specialties: input.specialties.map((id) => getSpecialty(props.specialtyGroups, id)),
		paycheck: {
			...input.paycheck,
			currency: lang === 'en' ? 'USD' : 'RUB'
		},
		location: undefined,
		hasTest: Boolean(input.test.description || input.test.file),
		test: {
			description: input.test.description,
			file: input.test.file
		}
	};
}

function convertProjectToProjectInput(project: Project): CreateProject {
	return {
		type: project.type.id,
		title: project.title,
		description: project.description,

		attachment: project.attachment,
		specialties: project.specialties.map((item) => item._id),
		location: project.location?._id,
		onlyPremium: project.onlyPremium,

		period: project.period,
		projectDate: project.projectDate,
		endDate: project.endDate,
		nonCommercial: project.nonCommercial,
		budget: project.budget,
		paycheck: project.paycheck,

		references: project.references,
		test: {
			description: project.test?.description || undefined,
			file: project.test?.file
		}
	};
}

export default connect(ProjectAddPage);
