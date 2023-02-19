import './restore-password.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import BackgroundMain from '@/common/views/background-main/background-main';
import {Formik, FormikHelpers} from 'formik';
import * as Yup from 'yup';
import Form from '@/common/views/form/form';
import Input from '@/common/views/input/input';
import Button from '@/common/views/button/button';
import {restorePassword} from '@/web/actions/data-provider';
import notificationActions from '@/web/actions/notification-actions';
import composeConnect from '@/common/core/compose/compose';
import {RouteComponentProps, withRouter} from 'react-router';
import {RestorePasswords} from '@/common/types/user';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';

const passworsdValidationSchema = Yup.object().shape({
	password: Yup.string().min(8, 'min').required('required'),
	password2: Yup.string()
		.oneOf([Yup.ref('password')], 'not-match')
		.required('required')
});

const mapDispatchToProps = {
	showNotification: notificationActions.showNotification
};

type ReduxProps = typeof mapDispatchToProps;

type Props = ReduxProps & RouteComponentProps & I18nProps;

interface State {
	isLoading: boolean;
	hash?: string;
}

const connect = composeConnect<{}, ReduxProps, RouteComponentProps, I18nProps>(
	ReactRedux.connect(null, mapDispatchToProps),
	withRouter,
	i18nConnect
);

const b = classname('restore-password-page');

class RestorePasswordPage extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			isLoading: true
		};
	}

	componentDidMount() {
		const parts = this.props.location.search
			.slice(1)
			.split('&')
			.map((part) => part.split('='));
		const hash = parts.reduce((acc, item) => (item[0] === 'hash' ? item[1] : acc), undefined);
		this.setState({hash});
	}

	private _onSubmit = (passwords: RestorePasswords, {setSubmitting}: FormikHelpers<RestorePasswords>): void => {
		const props = this.props;
		const hash = this.state.hash;
		if (!hash) {
			props.showNotification({
				view: 'success',
				text: props.translates.errors.base,
				close: true
			});
			setSubmitting(false);
			return;
		}
		restorePassword({...passwords, hash}).then((result) => {
			if (result) {
				props.showNotification({
					view: 'success',
					text: props.translates.notifications.passwordChanged,
					timeout: true
				});
				props.history.push('/signin');
			} else {
				props.showNotification({
					view: 'error',
					text: props.translates.errors.passwordChange,
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
					<div className={b('title')}>{t.pages.auth.restorePassword.title}</div>
					<Formik
						initialValues={{password: '', password2: ''}}
						validationSchema={passworsdValidationSchema}
						onSubmit={this._onSubmit}
					>
						{({values, touched, errors, handleSubmit, handleChange, handleBlur, isSubmitting}) => (
							<Form onSubmit={handleSubmit} disabled={isSubmitting}>
								<Input
									name="password"
									type="password"
									value={values.password}
									placeholder={t.password}
									onChange={handleChange}
									onBlur={handleBlur}
									error={touched.password && errors.password && t.errors.invalidPassword}
								/>
								<Input
									name="password2"
									type="password"
									value={values.password2}
									placeholder={t.confirmPassword}
									onChange={handleChange}
									onBlur={handleBlur}
									error={touched.password2 && errors.password2 && t.errors.invalidPassword2}
								/>
								<div className={b('buttons')}>
									<div>
										<Button type="submit" text={t.buttons.send} minWidth />
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

export default connect(RestorePasswordPage);
