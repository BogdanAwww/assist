import './common.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import {Viewer, Country, City} from '@/common/types/user';
import appActions from '@/web/actions/app-actions';
import notificationActions from '@/web/actions/notification-actions';
import AppState, {RoleType} from '@/web/state/app-state';
import {FormikProps, Formik, FormikHelpers} from 'formik';
import Avatar from '@/common/views/avatar/avatar';
import Preloader from '@/common/views/preloader/preloader';
import FilePicker from '@/common/views/file-picker/file-picker';
import Button from '@/common/views/button/button';
import {getCommonSettings, CommonSettings, getSchemaByRole} from '@/web/utils/user-utils';
import Input from '@/common/views/input/input';
import Textarea from '@/common/views/textarea/textarea';
import Select from '@/common/views/select/select';
import asyncAction, {AsyncAction} from '@/common/core/async-action/async-action';
import {getCitiesByCountry, loadViewer, updateUser} from '@/web/actions/data-provider';
import upload from '@/web/utils/upload/upload';
import Label from '@/common/views/label/label';
import PageTitle from '@/web/views/page-title/page-title';
import Checkbox from '@/common/views/checkbox/checkbox';
import {TranslatesContext} from '@/common/views/translates-provider/translates-provider';

interface StateToProps {
	viewer: Viewer;
	role?: RoleType;
	countries: Country[];
}

const mapDispatchToProps = {
	updateViewer: appActions.updateViewer,
	showNotification: notificationActions.showNotification,
	loadCountries: appActions.loadCountries
};

type ReduxProps = StateToProps & typeof mapDispatchToProps;

type Props = ReduxProps;

interface State {
	avatar: string;
	avatarUploading?: boolean;
	settings: CommonSettings;
	cities: City[];
	showSaveDialog?: boolean;
}

const connect = ReactRedux.connect(
	(state: AppState): StateToProps => ({
		viewer: state.viewer!,
		role: state.role,
		countries: state.countries
	}),
	mapDispatchToProps
);

const b = classname('common-page');

class CommonPage extends React.PureComponent<Props, State> {
	static contextType = TranslatesContext;
	private _loadViewerAction?: AsyncAction;

	constructor(props: Props) {
		super(props);

		this.state = {
			settings: getCommonSettings(props.viewer),
			avatar: '',
			cities: []
		};
	}

	componentDidMount() {
		this._loadViewer();
		this._updateInitialUser(this.props.viewer);
		this.props.loadCountries();
	}

	private _loadViewer = (): void => {
		asyncAction.cancel(this._loadViewerAction);

		this._loadViewerAction = asyncAction.create(this._loadViewerWithCities(), {
			success: ([viewer, cities]) => {
				if (viewer) {
					this._updateInitialUser(viewer);
				}
				this.setState({cities});
			}
		});
	};

	private _loadViewerWithCities = (): Promise<[Viewer | undefined, City[]]> => {
		return loadViewer().then(async (viewer) => {
			if (viewer) {
				if (viewer?.country) {
					const cities = await getCitiesByCountry(viewer.country._id);
					return [viewer, cities];
				}
			}
			return [viewer, []];
		});
	};

	private _loadCities = (countryId: string): void => {
		this.setState({cities: []});
		getCitiesByCountry(countryId).then((cities) => {
			this.setState({cities});
		});
	};

	private _updateInitialUser = (viewer: Viewer): void => {
		this.props.updateViewer(viewer);
		this.setState({
			avatar: viewer.avatar?.urlTemplate?.replace('%s', 'md') || '',
			settings: getCommonSettings(viewer)
		});
	};

	private _onAvatarChange = (file: File, form: FormikProps<CommonSettings>) => {
		this.setState({avatarUploading: true});
		upload('image', file).then((upload) => {
			if (upload) {
				form.setFieldValue('avatar', upload._id);
				this.setState({
					avatar: upload.urlTemplate || ''
				});
			}
			this.setState({avatarUploading: false});
		});
	};

	private _onUserProfileSubmit = (settings: CommonSettings, {setSubmitting}: FormikHelpers<CommonSettings>): void => {
		const props = this.props;
		const t = this.context.translates;
		updateUser({...settings, username: props.viewer.username}).then((viewer) => {
			if (viewer) {
				this._updateInitialUser(viewer);
				props.showNotification({
					view: 'success',
					text: t['saved'],
					timeout: true
				});
			} else {
				props.showNotification({
					view: 'error',
					text: t['savedError'],
					timeout: true
				});
			}
			setSubmitting(false);
		});
	};

	private _renderAvatar = (form: FormikProps<CommonSettings>): React.ReactNode => {
		const t = this.context.translates;
		const state = this.state;
		return (
			<div className={b('avatar')}>
				<div className={b('avatar-wrapper')}>
					<Avatar url={state.avatar} size={120} />
					{state.avatarUploading ? <Preloader size="small" overlay /> : null}
				</div>
				<div className={b('avatar-edit')}>
					<FilePicker accept="image" onChange={(file) => file && this._onAvatarChange(file, form)}>
						{({onClick}) => (
							<Button
								view="bordered"
								size="small"
								text={t['changeAvatar']}
								onClick={onClick}
								disabled={state.avatarUploading || form.isSubmitting}
							/>
						)}
					</FilePicker>
				</div>
			</div>
		);
	};

	private _renderProfileSettings = (form: FormikProps<CommonSettings>): React.ReactNode => {
		const t = this.context.translates;
		return (
			<div className={b('profile')}>
				<Label required>{t['name']}</Label>
				<Input
					name="firstName"
					size="small"
					autocomplete="off"
					maxLength={30}
					value={form.values.firstName}
					disabled={form.isSubmitting}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					error={form.touched.firstName && form.errors.firstName}
				/>
				<Label required>{t['surname']}</Label>
				<Input
					name="lastName"
					size="small"
					maxLength={40}
					value={form.values.lastName}
					disabled={form.isSubmitting}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					error={form.touched.lastName && form.errors.lastName}
				/>
				<Label>{t['aboutMyself']}</Label>
				<Textarea
					rows={5}
					name="description"
					size="small"
					maxlength={400}
					value={form.values.description}
					disabled={form.isSubmitting}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					error={form.touched.description && form.errors.description}
				/>
				<Label required>{t['location']}</Label>
				<Select
					select
					name="country"
					size="small"
					label={t['country']}
					placeholder=""
					defaultValue={null}
					value={form.values.country}
					disabled={form.isSubmitting}
					onChange={(option) => {
						form.setFieldValue('country', option._id);
						form.setFieldValue('city', undefined);
						this._loadCities(option._id);
					}}
					options={this.props.countries}
					getOptionLabel={(option) => option.localeName}
					getOptionValue={(option) => option._id}
					error={form.touched.country && form.errors.country}
				/>
				<div className={b('city')}>
					<Select
						select
						name="city"
						size="small"
						label={t['city']}
						placeholder=""
						noOptionsMessage={() => t['chooseCountry']}
						value={form.values.city}
						disabled={form.isSubmitting}
						onChange={(option) => form.setFieldValue('city', option._id)}
						options={this.state.cities}
						getOptionLabel={(option) => option.localeName}
						getOptionValue={(option) => option._id}
						error={form.touched.city && form.errors.city}
					/>
				</div>
				<Checkbox name="busy" value={form.values.busy} setFieldValue={form.setFieldValue}>
					{t['iamBusy']}
					<div className={b('muted')}>{t['iamBusyDisclaimer']}</div>
				</Checkbox>
				<div className={b('submit')}>
					<Button
						text={t['saveChanges']}
						view="primary"
						disabled={!form.dirty || form.isSubmitting}
						onClick={form.handleSubmit}
					/>
				</div>
			</div>
		);
	};

	render(): React.ReactNode {
		const t = this.context.translates;
		return (
			<div className={b()}>
				<PageTitle>{t['commonInformation']}</PageTitle>
				<Formik
					initialValues={this.state.settings}
					onSubmit={this._onUserProfileSubmit}
					validationSchema={getSchemaByRole('COMMON', this.props.role)}
					enableReinitialize
				>
					{(form) => (
						<>
							{this._renderAvatar(form)}
							{this._renderProfileSettings(form)}
						</>
					)}
				</Formik>
			</div>
		);
	}
}

export default connect(CommonPage);
