import './forgot-password.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import BackgroundMain from '@/common/views/background-main/background-main';
import {Formik, FormikHelpers} from 'formik';
import * as Yup from 'yup';
import Form from '@/common/views/form/form';
import Input from '@/common/views/input/input';
import Button from '@/common/views/button/button';
import {requestRestorePassword} from '@/web/actions/data-provider';
import notificationActions from '@/web/actions/notification-actions';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';

interface Values {
	login: string;
}

const loginValidationSchema = Yup.object().shape({
	login: Yup.string().email('invalid').required('required')
});

const mapDispatchToProps = {
	showNotification: notificationActions.showNotification
};

type ReduxProps = typeof mapDispatchToProps;

type Props = ReduxProps & I18nProps;

const connect = ReactRedux.connect(null, mapDispatchToProps);

const b = classname('forgot-password-page');

class ForgotPasswordPage extends React.Component<Props> {
	private _onSubmit = ({login}: Values, {setSubmitting}: FormikHelpers<Values>): void => {
		requestRestorePassword(login).then((result) => {
			const props = this.props;
			if (result) {
				props.showNotification({
					view: 'success',
					text: this.props.translates.notifications.forgotPasswordSent,
					close: true
				});
			} else {
				props.showNotification({
					view: 'error',
					text: this.props.translates.notifications.tryAgainLater,
					timeout: true
				});
			}
			setSubmitting(false);
		});
	};

	render(): React.ReactNode {
		const t = this.props.translates;
		return (
			<BackgroundMain>
				<div className={b()}>
					<div className={b('title')}>{t.pages.auth.forgot.title}</div>
					<div className={b('disclaimer')}>{t.pages.auth.forgot.disclaimer}</div>
					<Formik
						initialValues={{login: ''}}
						validationSchema={loginValidationSchema}
						onSubmit={this._onSubmit}
					>
						{({values, touched, errors, handleSubmit, handleChange, handleBlur, isSubmitting}) => (
							<Form onSubmit={handleSubmit} disabled={isSubmitting}>
								<Input
									name="login"
									value={values.login}
									placeholder={t.login}
									onChange={handleChange}
									onBlur={handleBlur}
									error={touched.login && errors.login ? t.errors.invalidLogin : undefined}
								/>
								<div className={b('buttons')}>
									<div>
										<Button type="submit" text={t.buttons.send} minWidth />
									</div>
									<div className={b('back')}>
										<Button view="invisible" text={t.buttons.back} url="/signin" minWidth />
									</div>
								</div>
							</Form>
						)}
					</Formik>
				</div>
			</BackgroundMain>
		);
	}
}

export default connect(i18nConnect(ForgotPasswordPage));
