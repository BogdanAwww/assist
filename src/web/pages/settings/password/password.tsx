import './password.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import PageTitle from '@/web/views/page-title/page-title';
import {Formik, FormikHelpers} from 'formik';
import {PASSWORD_VALIDATION_SCHEMA} from '@/web/utils/user-utils';
import Form from '@/common/views/form/form';
import Input from '@/common/views/input/input';
import Label from '@/common/views/label/label';
import Button from '@/common/views/button/button';
import {changePassword} from '@/web/actions/data-provider';
import appActions from '@/web/actions/app-actions';
import notificationActions from '@/web/actions/notification-actions';
import {TranslatesContext} from '@/common/views/translates-provider/translates-provider';

const mapDispatchToProps = {
	updateViewer: appActions.updateViewer,
	showNotification: notificationActions.showNotification
};

interface Passwords {
	password: string;
	newPassword: string;
	newPassword2: string;
}

const initiallPasswordValues = {
	password: '',
	newPassword: '',
	newPassword2: ''
};

type Props = typeof mapDispatchToProps;

const b = classname('password-page');

const connect = ReactRedux.connect(null, mapDispatchToProps);

class PasswordPage extends React.PureComponent<Props> {
	static contextType = TranslatesContext;
	private _onPasswordChangeSubmit = (passwords: Passwords, {setSubmitting}: FormikHelpers<Passwords>): void => {
		const props = this.props;
		const t = this.context.translates;

		changePassword(passwords)
			.then((isSuccess) => {
				if (isSuccess) {
					props.showNotification({
						view: 'success',
						text: t['passwordChanged'],
						timeout: true
					});
				}
			})
			.catch((error) => {
				if (error?.message) {
					props.showNotification({
						view: 'error',
						text: error.message,
						timeout: true
					});
				}
			})
			.finally(() => {
				setSubmitting(false);
			});
	};

	render(): React.ReactNode {
		const t = this.context.translates;
		return (
			<div className={b()}>
				<PageTitle>{t['changePassword']}</PageTitle>
				<Formik
					initialValues={initiallPasswordValues}
					validationSchema={PASSWORD_VALIDATION_SCHEMA}
					onSubmit={this._onPasswordChangeSubmit}
				>
					{({values, touched, errors, handleBlur, handleChange, handleSubmit, isSubmitting}) => (
						<Form onSubmit={handleSubmit} disabled={isSubmitting}>
							<Label>{t['lastPassword']}</Label>
							<Input
								name="password"
								autocomplete="current-password"
								type="password"
								size="small"
								value={values.password}
								onChange={handleChange}
								onBlur={handleBlur}
								error={touched.password && errors.password}
							/>
							<Label>{t['newPassword']}</Label>
							<Input
								name="newPassword"
								autocomplete="off"
								type="password"
								size="small"
								value={values.newPassword}
								onChange={handleChange}
								onBlur={handleBlur}
								error={touched.newPassword && errors.newPassword}
							/>
							<Label>{t['confirmPassword']}</Label>
							<Input
								name="newPassword2"
								autocomplete="off"
								type="password"
								size="small"
								value={values.newPassword2}
								onChange={handleChange}
								onBlur={handleBlur}
								error={touched.newPassword2 && errors.newPassword2}
							/>
							<div className={b('button')}>
								<Button type="submit" view="primary" text={t['save']} />
							</div>
						</Form>
					)}
				</Formik>
			</div>
		);
	}
}

export default connect(PasswordPage);
