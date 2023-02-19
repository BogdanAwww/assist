import './contacts.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import PageTitle from '@/web/views/page-title/page-title';
import {Viewer} from '@/common/types/user';
import appActions from '@/web/actions/app-actions';
import notificationActions from '@/web/actions/notification-actions';
import {getContactsSettings, ContactsSettings, getSchemaByRole} from '@/web/utils/user-utils';
import AppState, {RoleType} from '@/web/state/app-state';
import {Formik, FormikProps, FormikHelpers} from 'formik';
import Input from '@/common/views/input/input';
import Checkbox from '@/common/views/checkbox/checkbox';
import Label from '@/common/views/label/label';
import {updateUser} from '@/web/actions/data-provider';
import Button from '@/common/views/button/button';
import {TranslatesContext} from '@/common/views/translates-provider/translates-provider';

interface StateToProps {
	viewer: Viewer;
	role?: RoleType;
}

const mapDispatchToProps = {
	loadViewer: appActions.loadViewer,
	showNotification: notificationActions.showNotification
};

type ReduxProps = StateToProps & typeof mapDispatchToProps;

type Props = ReduxProps;

interface State {
	settings: ContactsSettings;
	showSaveDialog?: boolean;
}

const connect = ReactRedux.connect(
	(state: AppState): StateToProps => ({
		viewer: state.viewer!,
		role: state.role
	}),
	mapDispatchToProps
);

const b = classname('contacts-page');

class ContactsPage extends React.PureComponent<Props, State> {
	static contextType = TranslatesContext;
	constructor(props: Props) {
		super(props);

		this.state = {
			settings: getContactsSettings(props.viewer)
		};
	}

	private _onUserProfileSubmit = (settings: ContactsSettings, helpers: FormikHelpers<ContactsSettings>): void => {
		const props = this.props;
		const t = this.context.translates;

		updateUser({...settings, username: props.viewer.username}).then((viewer) => {
			if (viewer) {
				props.loadViewer();
				this.setState({settings: getContactsSettings(viewer)});
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

	private _renderContacts = (form: FormikProps<ContactsSettings>): React.ReactNode => {
		const t = this.context.translates;
		return (
			<>
				<Label required>{t['email']}</Label>
				<Input
					name="email"
					size="small"
					value={form.values.email}
					disabled={form.isSubmitting}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					error={form.touched.email && form.errors.email}
				/>
				<Label>{t['phoneNumber']}</Label>
				<Input
					name="phone"
					size="small"
					value={form.values.phone}
					disabled={form.isSubmitting}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					error={form.touched.phone && form.errors.phone}
				/>
				<div className={b('hide-contacts')}>
					<Checkbox name="hidePhone" value={form.values.hidePhone} setFieldValue={form.setFieldValue}>
						{t['hidePhoneNumber']}
					</Checkbox>
				</div>
				<Label>{t['site']}</Label>
				<Input
					name="website"
					size="small"
					value={form.values.website}
					disabled={form.isSubmitting}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					error={form.touched.website && form.errors.website}
				/>
				<Label>{t['additionalLinks']}</Label>
				<Input
					name="contacts.0"
					size="small"
					value={form.values.contacts[0]}
					disabled={form.isSubmitting}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					error={form.touched.contacts?.[0] && form.errors.contacts?.[0]}
				/>
				<Input
					name="contacts.1"
					size="small"
					value={form.values.contacts[1]}
					disabled={form.isSubmitting}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					error={form.touched.contacts?.[1] && form.errors.contacts?.[1]}
				/>
				<Input
					name="contacts.2"
					size="small"
					value={form.values.contacts[2]}
					disabled={form.isSubmitting}
					onChange={form.handleChange}
					onBlur={form.handleBlur}
					error={form.touched.contacts?.[2] && form.errors.contacts?.[2]}
				/>
				<div className={b('submit')}>
					<Button
						text={t['saveChanges']}
						view="primary"
						disabled={!form.dirty || form.isSubmitting}
						onClick={form.handleSubmit}
					/>
				</div>
			</>
		);
	};

	render(): React.ReactNode {
		const t = this.context.translates;

		return (
			<div className={b()}>
				<PageTitle>{t['contactInformation']}</PageTitle>
				<Formik
					initialValues={this.state.settings}
					onSubmit={this._onUserProfileSubmit}
					validationSchema={getSchemaByRole('CONTACTS', this.props.role)}
					enableReinitialize
				>
					{this._renderContacts}
				</Formik>
			</div>
		);
	}
}

export default connect(ContactsPage);
