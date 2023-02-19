import './portfolio-edit.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import * as Yup from 'yup';
import Button from '@/common/views/button/button';
import Input from '@/common/views/input/input';
import {Formik, FormikHelpers, FormikProps} from 'formik';
import {CreatePortfolioProject, ParticipantInput, PortfolioProject} from '@/common/types/portfolio-project';
import Label from '@/common/views/label/label';
import Textarea from '@/common/views/textarea/textarea';
import BadgeSelector from '@/common/views/badge-selector/badge-selector';
import appActions from '@/web/actions/app-actions';
import {ProjectType} from '@/common/types/project';
import AppState from '@/web/state/app-state';
import {Viewer} from '@/common/types/user';
import {
	createPortfolioProject,
	getPortfolioProject,
	getUser,
	updatePortfolioProject,
	sendMetrics
} from '@/web/actions/data-provider';
import ErrorLabel from '@/common/views/error-label/error-label';
import PortfolioProjectCard from '@/web/views/portfolio-project-card/portfolio-project-card';
import {getProjectTypeTitle, parsePortfolioLink} from '@/web/utils/project-utils';
import {getSpecialtySelectOptions, getSpecialtyTitle} from '@/web/utils/specialty-utils';
import {SpecialtyGroup} from '@/common/types/specialty';
import composeConnect from '@/common/core/compose/compose';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import PortfolioProjectPreview from '@/web/views/portfolio-project-preview/portfolio-project-preview';
import Avatar from '@/common/views/avatar/avatar';
import GetUserView from '@/web/views/get-user-view/get-user-view';
import Select, {SelectOptionsType} from '@/common/views/select/select';
import SpecialtiesSidebar from '@/web/views/specialties-sidebar/specialties-sidebar';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import IconInfo from '@/common/views/icon-info/icon-info';
import Hint from '@/common/views/hint/hint';
import UploadList from '@/common/views/upload-list/upload-list';
import Uploader from '@/common/views/uploader/uploader';
import Dialog from '@/common/views/dialog/dialog';
import {TranslatesContext, translates} from '@/common/views/translates-provider/translates-provider';

import closeIcon from '@/common/icons/close.svg';

function getValidation() {
	const t = translates.pages.contractor.portfolio.edit.validation;
	const linkValidator = Yup.string().test('link', t.link, (url) =>
		url?.trim() ? Boolean(parsePortfolioLink(url)) : true
	);
	const validationStepOne = Yup.object()
		.shape({
			title: Yup.string().required(t.title),
			description: Yup.string().required(t.description),
			link: linkValidator,
			attachment: Yup.object()
		})
		.test('linkOrFile', t.linkOrFile, function (value) {
			return !value?.link?.trim() && !value?.attachment
				? this.createError({
						path: !value?.link ? 'link' : 'attachment',
						message: t.linkOrFile
				  })
				: false;
		});

	const validationStepTwo = Yup.object().shape({
		type: Yup.string().required(t.projectType),
		specialty: Yup.string().required(t.specialty)
	});

	const participantValidation = Yup.object()
		.shape({
			username: Yup.string(),
			name: Yup.string(),
			specialty: Yup.string().required(t.specialty)
		})
		.test('userOrName', t.userOrName, function (value) {
			return !value?.username && !value?.name
				? this.createError({
						path: !value?.username ? 'username' : 'name',
						message: t.userOrName
				  })
				: false;
		});
	return {
		one: validationStepOne,
		two: validationStepTwo,
		participant: participantValidation
	};
}

const mapDispatchToProps = {
	loadProjectTypes: appActions.loadProjectTypes,
	loadSpecialtyGroups: appActions.loadSpecialtyGroups,
	loadViewer: appActions.loadViewer,
	updateViewer: appActions.updateViewer
};

interface StateToProps {
	viewer: Viewer;
	projectTypes: ProjectType[];
	specialtyGroups: SpecialtyGroup[];
}

interface SelfProps {}

type ReduxProps = StateToProps & typeof mapDispatchToProps;

type Props = SelfProps & ReduxProps & RouteComponentProps<{id?: string}>;

interface State {
	id?: string;
	step: number;
	attachmentUploading?: boolean;
	thumbnailUrl?: string;
	initialValues: CreatePortfolioProject;
	dialog: {
		isOpen: boolean;
	};
	validation: any;
}

const connect = composeConnect<SelfProps, ReduxProps, RouteComponentProps<{id?: string}>>(
	ReactRedux.connect(
		(state: AppState): StateToProps => ({
			viewer: state.viewer!,
			projectTypes: state.projectTypes || [],
			specialtyGroups: state.specialtyGroups || []
		}),
		mapDispatchToProps
	),
	withRouter
);

const b = classname('portfolio-edit-page');

const STEPS_SHOW = 3;
const STEPS_LIMIT = 4;

class PortfolioEditPage extends React.Component<Props, State> {
	static contextType = TranslatesContext;
	constructor(props: Props) {
		super(props);

		this.state = {
			step: 1,
			id: props.match.params.id,
			initialValues: {
				title: '',
				description: '',
				link: '',
				attachment: undefined,
				type: '',
				specialty: undefined,
				responsibilities: '',
				participants: []
			},
			dialog: {
				isOpen: false
			},
			validation: getValidation()
		};
	}

	componentDidMount() {
		const props = this.props;
		props.loadSpecialtyGroups();
		props.loadProjectTypes();

		const state = this.state;
		if (state.id) {
			getPortfolioProject({id: state.id}).then((project) => {
				if (project) {
					this.setState({
						initialValues: getInitialValues(project)
					});
				}
			});
		}
	}

	private _nextStep = (props: FormikProps<CreatePortfolioProject>): void => {
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

	private _getValidationSchema = (): any => {
		const step = this.state.step;
		if (step === 1) {
			return this.state.validation.one;
		}
		if (step === 2) {
			return this.state.validation.two;
		}
		return;
	};

	private _onSubmit = (
		input: CreatePortfolioProject,
		{setSubmitting}: FormikHelpers<CreatePortfolioProject>
	): void => {
		const id = this.state.id;
		const method = id ? updatePortfolioProject({id, input}) : createPortfolioProject({input});
		method
			.then((project) => {
				if (project) {
					this.props.loadViewer();
					this._isFirstProject();
				}
			})
			.finally(() => {
				setSubmitting(false);
			});
	};

	private _isFirstProject = (): void => {
		const viewer = this.props.viewer;
		const firstProjectInPortfolio = viewer.modals?.firstProjectInPortfolio;
		if (firstProjectInPortfolio) {
			this.props.history.push('/portfolio');
		} else {
			sendMetrics({type: 'modals_firstProjectInPortfolio', data: true}).then(() => {
				this.props.updateViewer({...viewer, modals: {...viewer.modals, firstProjectInPortfolio: true}});
				this.setState({
					dialog: {
						isOpen: true
					}
				});
			});
		}
	};

	private _onProfileLinkChange = (value: string): Promise<SelectOptionsType> => {
		const parts = value.match(/\/profile\/(.*)$/);
		const username = parts?.[1] || value;
		if (username) {
			return getUser({username})
				.then((user) => {
					if (user) {
						return [
							{
								label: user.localeFullname || '',
								value: user.username
							}
						];
					} else {
						return [];
					}
				})
				.catch(() => []);
		}
		return Promise.resolve([]);
	};

	private _addParticipant = (
		form: FormikProps<CreatePortfolioProject>,
		participant: ParticipantInput,
		{setSubmitting}: FormikHelpers<ParticipantInput>
	): void => {
		const participants = form.values.participants || [];
		form.setFieldValue('participants', participants.concat([participant]));
		setSubmitting(false);
	};

	private _renderStepCount = (): React.ReactNode => {
		const step = this.state.step;
		if (step > 3) {
			return null;
		}
		return (
			<div className={b('step')}>
				{this.context.translates.pages.contractor.portfolio.edit.step} <b>{step}</b> /{STEPS_SHOW}
			</div>
		);
	};

	private _renderStepOne = (form: FormikProps<CreatePortfolioProject>): React.ReactNode => {
		const t = this.context.translates;
		return (
			<div className={b('one')}>
				<Label
					text={
						<>
							{t['projectName']}
							<Hint position="top" content={t['projectNameHint']}>
								<IconInfo margin />
							</Hint>
						</>
					}
				/>
				<Input
					name="title"
					size="small"
					value={form.values.title}
					disabled={form.isSubmitting}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					error={form.touched.title && form.errors.title}
				/>
				<Label text={t['describe']} />
				<Textarea
					name="description"
					size="small"
					rows={5}
					placeholder={t['fewWordsAboutProject']}
					value={form.values.description}
					disabled={form.isSubmitting}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					maxlength={300}
					error={form.touched.description && form.errors.description}
				/>
				<Label
					text={
						<>
							{t['link']}
							<Hint position="top" content={t.pages.contractor.portfolio.edit.linkDisclaimer}>
								<IconInfo margin />
							</Hint>
						</>
					}
				/>
				<Uploader accept="document" onChange={(upload) => form.setFieldValue('attachment', upload)}>
					{({onClick, uploading}) => (
						<>
							<Input
								name="link"
								size="small"
								placeholder={t['addLinkToProject']}
								value={form.values.link}
								disabled={uploading || Boolean(form.values.attachment) || form.isSubmitting}
								onChange={form.handleChange}
								onBlur={form.handleBlur}
								error={form.touched.link && form.errors.link}
							/>
							<UploadList
								uploads={form.values.attachment ? [form.values.attachment] : []}
								onRemove={() => form.setFieldValue('attachment', undefined, true)}
							>
								<div className={b('attachment')}>
									<div className={b('attachment-disclaimer')}>
										<div className={b('attachment-label')}>{t['orAddFile']}</div>
										{t['ifWorkNotVideo']}
									</div>
									<div className={b('attachment-button')}>
										<Button
											view="bordered"
											size="medium"
											text={t['chooseFile']}
											onClick={onClick}
											disabled={
												Boolean(form.values.link) ||
												this.state.attachmentUploading ||
												form.isSubmitting
											}
											stretched
										/>
									</div>
								</div>
							</UploadList>
						</>
					)}
				</Uploader>
				<ErrorLabel>{(form.touched.link || form.touched.attachment) && form.errors.attachment}</ErrorLabel>
			</div>
		);
	};

	private _renderStepTwo = (form: FormikProps<CreatePortfolioProject>): React.ReactNode => {
		const props = this.props;
		const projectTypesItems = (props.projectTypes || []).map((item) => ({title: item.title, value: item.id}));
		const specialtyOptions = getSpecialtySelectOptions(props.specialtyGroups);
		const t = this.context.translates;
		return (
			<div className={b('two')}>
				<Label text={t['projectType']} />
				<BadgeSelector
					name="type"
					view="gray"
					size="small"
					value={form.values.type}
					items={projectTypesItems}
					onChange={form.setFieldValue}
				/>
				<ErrorLabel>{form.touched.type && form.errors.type}</ErrorLabel>
				<Label text={t['speciality']} />
				<SpecialtiesSidebar
					selected={[form.values.specialty].filter((item): item is string => Boolean(item))}
					onChange={(values) => form.setFieldValue('specialty', values[0])}
					single
				>
					{({openSidebar}) => (
						<Select
							name="specialty"
							placeholder={t['chooseSpeciality']}
							options={specialtyOptions}
							value={form.values.specialty}
							components={{
								IndicatorSeparator: () => null,
								DropdownIndicator: () => null
							}}
							openMenuOnClick={false}
							openMenuOnFocus={false}
							onFocus={openSidebar}
							error={form.touched.specialty && form.errors.specialty}
						/>
					)}
				</SpecialtiesSidebar>
				<Label text={t['whatDidYouDo']} />
				<Textarea
					name="responsibilities"
					size="small"
					rows={5}
					placeholder={t['whatDidYouDoDisclaimer']}
					value={form.values.responsibilities}
					disabled={form.isSubmitting}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					maxlength={300}
					error={form.touched.responsibilities && form.errors.responsibilities}
				/>
			</div>
		);
	};

	private _renderStepThree = (form: FormikProps<CreatePortfolioProject>): React.ReactNode => {
		const props = this.props;
		const participants = form.values.participants;
		const specialtyOptions = getSpecialtySelectOptions(props.specialtyGroups);
		const t = this.context.translates;
		return (
			<div className={b('three')}>
				<Label>
					{t['projectParticipants']}{' '}
					<Hint position="right" content={t['projectParticipantsHint']}>
						<IconInfo size="small" />
					</Hint>
				</Label>
				<div className={b('participants-list')}>
					{participants.map((participant, index) => (
						<div className={b('participant')} key={index}>
							<GetUserView username={participant.username}>
								{({user}) => (
									<>
										<Avatar user={user} size={24} />
										<div className={b('participant-name')}>
											{user?.localeFullname || participant.name}
										</div>
										<div className={b('participant-specialty')}>
											{getSpecialtyTitle(props.specialtyGroups, participant.specialty)}
										</div>
										<div
											className={b('participant-remove')}
											onClick={() =>
												form.setFieldValue(
													'participants',
													form.values.participants.filter((user) => user !== participant)
												)
											}
										>
											<SvgIcon url={closeIcon} width={16} height={16} />
										</div>
									</>
								)}
							</GetUserView>
						</div>
					))}
					{participants.length === 0 ? (
						<div className={b('participants-empty')}>{t['noParticipants']}</div>
					) : null}
				</div>
				<Formik<ParticipantInput>
					initialValues={{name: '', username: '', specialty: ''}}
					validationSchema={this.state.validation.participant}
					onSubmit={(participant, helpers) => {
						this._addParticipant(form, participant, helpers);
						helpers.resetForm();
					}}
				>
					{(subform) => (
						<>
							<Label text={t['contractorProfile']} />
							<Select
								name="username"
								value={subform.values.username}
								placeholder={t['profileLinkOrId']}
								onInputChange={this._onProfileLinkChange}
								onChange={(data) => subform.setFieldValue('username', data?.value)}
								isClearable
								error={subform.touched.username && subform.errors.username}
							/>
							<Label text={t['or'] + ' ' + t['name']} />
							<Input
								name="name"
								size="small"
								value={subform.values.name}
								disabled={Boolean(subform.values.username) || subform.isSubmitting}
								onChange={subform.handleChange}
								onBlur={subform.handleBlur}
								error={subform.touched.name && subform.errors.name}
							/>
							<Label text={t['speciality']} />
							<SpecialtiesSidebar
								selected={[subform.values.specialty].filter(Boolean)}
								onChange={(values) => subform.setFieldValue('specialty', values[0])}
								single
							>
								{({openSidebar}) => (
									<Select
										name="specialty"
										placeholder={t['chooseSpeciality']}
										options={specialtyOptions}
										value={subform.values.specialty}
										components={{
											IndicatorSeparator: () => null,
											DropdownIndicator: () => null
										}}
										openMenuOnClick={false}
										openMenuOnFocus={false}
										onFocus={openSidebar}
										error={subform.touched.specialty && subform.errors.specialty}
									/>
								)}
							</SpecialtiesSidebar>
							<Button
								className={b('participants-add')}
								text={t['addMember']}
								onClick={() => {
									subform.setTouched({username: true, name: true, specialty: true}, true);
									subform.submitForm();
								}}
							/>
						</>
					)}
				</Formik>
			</div>
		);
	};

	private _renderStepFour = (props: FormikProps<CreatePortfolioProject>): React.ReactNode => {
		const state = this.state;
		const t = this.context.translates;
		return (
			<div className={b('four')}>
				<div className={b('preview-title')}>{t['projectLooksForOther']}</div>
				<div className={b('preview-card')}>
					<PortfolioProjectPreview hideControls>
						{({showPreview}) => (
							<PortfolioProjectCard
								title={props.values.title}
								specialty={getSpecialtyTitle(this.props.specialtyGroups, props.values.specialty || '')}
								link={props.values.link}
								attachment={props.values.attachment}
								onClick={() =>
									showPreview(
										getPreviewProject(
											this.props.viewer,
											this.props.projectTypes,
											this.props.specialtyGroups,
											props.values
										)
									)
								}
							/>
						)}
					</PortfolioProjectPreview>
				</div>
				<div className={b('controls')}>
					<div className={b('prev')}>
						<Button view="secondary" text={t['back']} onClick={this._prevStep} stretched />
					</div>
					<div className={b('next')}>
						<Button text={state.id ? t['save'] : t['publish']} onClick={props.submitForm} stretched />
					</div>
				</div>
			</div>
		);
	};

	private _renderStepControls = (props: FormikProps<CreatePortfolioProject>): React.ReactNode => {
		const step = this.state.step;
		const t = this.context.translates;
		return (
			<div className={b('controls')}>
				<div className={b('prev')}>
					{step > 1 ? <Button view="secondary" text={t['back']} onClick={this._prevStep} stretched /> : null}
				</div>
				<div className={b('next')}>
					<Button
						text={step === STEPS_LIMIT ? t['preview'] : t['next']}
						onClick={() => this._nextStep(props)}
						stretched
					/>
				</div>
			</div>
		);
	};

	private _renderSteps = (props: FormikProps<CreatePortfolioProject>): React.ReactNode => {
		const step = this.state.step;
		return (
			<>
				{this._renderStepCount()}
				{step === 1 ? this._renderStepOne(props) : null}
				{step === 2 ? this._renderStepTwo(props) : null}
				{step === 3 ? this._renderStepThree(props) : null}
				{this._renderStepControls(props)}
			</>
		);
	};

	private _renderCongratulations = (): React.ReactNode => {
		const t = this.context.translates;
		return (
			<div className={b('congratulation__wrapper')}>
				<h2 className={b('congratulation__title')}>{t.portfolioEditDialog?.[0]}</h2>
				<div className={b('congratulation__subtitle')}>{t.portfolioEditDialog?.[1]}</div>
				<div className={b('congratulation__list-title')}>{t.portfolioEditDialog?.[2]}</div>
				<ul className={b('congratulation__list')}>
					<li className={b('congratulation__list__item')}>{t.portfolioEditDialog?.[3]}</li>
					<li className={b('congratulation__list__item')}>{t.portfolioEditDialog?.[4]}</li>
					<li className={b('congratulation__list__item')}>{t.portfolioEditDialog?.[5]}</li>
				</ul>
				<Button
					className={b('congratulation__button')}
					text={t['continue']}
					onClick={() => this.props.history.push('/portfolio')}
				/>
			</div>
		);
	};

	render(): React.ReactNode {
		const state = this.state;
		const step = state.step;
		const t = this.context.translates;
		return (
			<>
				<Formik
					initialValues={state.initialValues}
					onSubmit={this._onSubmit}
					validationSchema={this._getValidationSchema()}
					enableReinitialize
				>
					{(props) => (
						<div className={b()}>
							<div className={b('title')}>
								{state.id ? t['editProjectInPortfolio'] : t['newProjectInPortfolio']}
							</div>
							<div className={b('content')}>
								{step <= STEPS_SHOW ? this._renderSteps(props) : null}
								{step === STEPS_LIMIT ? this._renderStepFour(props) : null}
							</div>
						</div>
					)}
				</Formik>
				<Dialog
					isOpen={state.dialog.isOpen}
					showClose={true}
					onClose={() => this.props.history.push('/portfolio')}
					overlayClose
				>
					{this._renderCongratulations()}
				</Dialog>
			</>
		);
	}
}

function getPreviewProject(
	viewer: Viewer,
	types: ProjectType[],
	specialtyGroups: SpecialtyGroup[],
	values: CreatePortfolioProject
): PortfolioProject {
	return {
		_id: undefined,
		author: viewer,
		title: values.title,
		description: values.description,
		attachment: values.attachment,
		type: {
			id: values.type,
			title: getProjectTypeTitle(types, values.type)
		},
		link: values.link,
		specialty: {
			_id: values.specialty || '',
			title: values.specialty ? getSpecialtyTitle(specialtyGroups, values.specialty) : ''
		}
	};
}

function getInitialValues(project: PortfolioProject): CreatePortfolioProject {
	return {
		title: project.title,
		description: project.description || '',
		link: project.link || '',
		attachment: project.link ? undefined : project.attachment,
		type: project.type.id,
		specialty: project.specialty?._id,
		responsibilities: project.responsibilities || '',
		participants: (project.participants || []).map((participant) => ({
			name: participant.user?.localeFullname || participant.name || '',
			username: participant.user?.username,
			specialty: participant.specialty?._id || ''
		}))
	};
}

export default connect(PortfolioEditPage);
