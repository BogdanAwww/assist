import './specialty.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import {Formik, FormikProps, FormikHelpers} from 'formik';
import appActions from '@/web/actions/app-actions';
import notificationActions from '@/web/actions/notification-actions';
import {Viewer} from '@/common/types/user';
import AppState, {RoleType} from '@/web/state/app-state';
import SpecialtiesSidebar from '@/web/views/specialties-sidebar/specialties-sidebar';
import SpecialtySetting from '@/common/views/specialty-setting/specialty-setting';
import {getSpecialtyTitle} from '@/web/utils/specialty-utils';
import {SpecialtyGroup} from '@/common/types/specialty';
import ErrorLabel from '@/common/views/error-label/error-label';
import {SpecialtySettings, getSpecialtySettings, getSchemaByRole} from '@/web/utils/user-utils';
import {updateUser} from '@/web/actions/data-provider';
import PageTitle from '@/web/views/page-title/page-title';
import Button from '@/common/views/button/button';
import Warning from '@/common/views/warning/warning';
import {TranslatesContext} from '@/common/views/translates-provider/translates-provider';

interface StateToProps {
	viewer: Viewer;
	role?: RoleType;
	specialtyGroups: SpecialtyGroup[];
}

const mapDispatchToProps = {
	loadViewer: appActions.loadViewer,
	showNotification: notificationActions.showNotification
};

type ReduxProps = StateToProps & typeof mapDispatchToProps;

type Props = ReduxProps;

interface State {
	settings: SpecialtySettings;
	showSaveDialog?: boolean;
}

const connect = ReactRedux.connect(
	(state: AppState): StateToProps => ({
		viewer: state.viewer!,
		role: state.role,
		specialtyGroups: state.specialtyGroups || []
	}),
	mapDispatchToProps
);

const LIMITS = {
	start: 3,
	basic: 3,
	premium: 6
};

const b = classname('specialties-page');

class SpecialtyPage extends React.PureComponent<Props, State> {
	static contextType = TranslatesContext;
	constructor(props: Props) {
		super(props);

		this.state = {
			settings: getSpecialtySettings(props.viewer)
		};
	}

	private _onSubmit = (settings: SpecialtySettings, helpers: FormikHelpers<SpecialtySettings>): void => {
		const props = this.props;
		const t = this.context.translates;
		updateUser({...settings, username: props.viewer.username}).then((viewer) => {
			if (viewer) {
				props.loadViewer();
				this.setState({settings: getSpecialtySettings(viewer)});
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
			helpers.setSubmitting(false);
		});
	};

	private _renderSpecialtiesSettingList = (form: FormikProps<SpecialtySettings>): React.ReactNode => {
		const t = this.context.translates;
		const lang = this.context.lang;
		const subscription = this.props.viewer.subscription;
		const level = subscription?.level || 'start';
		const limit = LIMITS[level];
		const specialties = (form.values.specialties as (string | undefined)[])
			.concat(new Array(limit).fill(undefined))
			.slice(0, limit);
		return (
			<div className={b('specialties-list')}>
				<SpecialtiesSidebar
					selected={form.values.specialties}
					limit={limit}
					onChange={(specialties) => {
						form.setFieldTouched('specialties', true, false);
						form.setFieldValue('specialties', specialties, true);
					}}
				>
					{({openSidebar}) =>
						specialties.map((id, index) => (
							<SpecialtySetting
								id={id}
								title={id ? getSpecialtyTitle(this.props.specialtyGroups, id, lang) : undefined}
								index={index}
								key={index}
								onAddClick={openSidebar}
								onRemoveClick={(id) => {
									form.setFieldTouched('specialties', true, false);
									form.setFieldValue(
										'specialties',
										form.values.specialties.filter((specialtyId) => specialtyId !== id),
										true
									);
								}}
							/>
						))
					}
				</SpecialtiesSidebar>
				<ErrorLabel>{form.touched.specialties && form.errors.specialties}</ErrorLabel>
				{level !== 'premium' ? (
					<Warning info margin>
						{t['specialityWarning']}
					</Warning>
				) : null}
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
				<PageTitle>{t['chooseSpeciality']}</PageTitle>
				<Formik
					initialValues={this.state.settings}
					onSubmit={this._onSubmit}
					validationSchema={getSchemaByRole('SPECIALTY', this.props.role)}
					enableReinitialize
				>
					{this._renderSpecialtiesSettingList}
				</Formik>
			</div>
		);
	}
}

export default connect(SpecialtyPage);
