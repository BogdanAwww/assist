import './signup.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import composeConnect from '@/common/core/compose/compose';
import qs from 'qs';
import classname from '@/common/core/classname';
import appActions from '@/web/actions/app-actions';
import Button from '@/common/views/button/button';
import {Viewer, SignupData} from '@/common/types/user';
import AppState from '@/web/state/app-state';
import {Formik, FormikHelpers, FormikProps} from 'formik';
import * as Yup from 'yup';
import notificationActions from '@/web/actions/notification-actions';
import {signupUser} from '@/web/actions/data-provider';
import Checkbox from '@/common/views/checkbox/checkbox';
import {RouteComponentProps, withRouter} from 'react-router';
import ErrorLabel from '@/common/views/error-label/error-label';
import LinkWrapper from '@/common/views/link-wrapper/link-wrapper';
import BackgroundMain from '@/common/views/background-main/background-main';
import Input from '@/common/views/input/input';
import Label from '@/common/views/label/label';
import PageTitle from '@/web/views/page-title/page-title';
import {hasErrorCode} from '@/common/core/apollo-client/errors';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';

const SIGNUP_VALIDATION = Yup.object().shape({
	firstName: Yup.string().required('required'),
	lastName: Yup.string().required('required'),
	email: Yup.string().email('invalid').required('required'),
	password: Yup.string()
		.test('right', 'invalid', function (value) {
			return /[a-zA-Z0-9!@#$%^&*_]+/g.test(value || '');
		})
		.min(8, 'min')
		.required('required'),
	password2: Yup.string()
		.oneOf([Yup.ref('password')], 'not-match')
		.required('required'),
	isAgree: Yup.boolean().required('required').oneOf([true], 'invalid')
});

interface StateToProps {
	viewer: Viewer;
}

const mapDispatchToProps = {
	updateViewer: appActions.updateViewer,
	showNotification: notificationActions.showNotification,
	loadCountries: appActions.loadCountries
};

interface SelfProps {}

type ReduxProps = StateToProps & typeof mapDispatchToProps;

type Props = SelfProps & ReduxProps & RouteComponentProps & I18nProps;

interface State {
	user: SignupData;
	isAgree: boolean;
}

const connect = composeConnect<SelfProps, ReduxProps, RouteComponentProps, I18nProps>(
	ReactRedux.connect(
		(state: AppState): StateToProps => ({
			viewer: state.viewer!
		}),
		mapDispatchToProps
	),
	withRouter,
	i18nConnect
);

const b = classname('signup-page');

class SignUpPage extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			user: {
				firstName: '',
				lastName: '',
				email: '',
				password: '',
				password2: ''
			},
			isAgree: false
		};
	}

	componentDidMount() {
		this.props.loadCountries();
		const search = qs.parse(this.props.location.search, {ignoreQueryPrefix: true}) || {};
		const hash = search.hash?.toString();
		if (hash) {
			localStorage.setItem('inviteHash', hash);
		}
	}

	private _onSubmit = (settings: SignupData, {setSubmitting}: FormikHelpers<SignupData>): void => {
		const props = this.props;
		const t = props.translates;
		const hash = localStorage.getItem('inviteHash') || undefined;
		signupUser({input: {...settings, hash}})
			.then((viewer) => {
				if (viewer) {
					props.updateViewer(viewer);
					props.history.push('/choose-role');
				} else {
					throw new Error('no viewer');
				}
			})
			.catch((error) => {
				const text =
					(hasErrorCode(error, 'NO_PASSWORD') && t.errors.NO_PASSWORD) ||
					(hasErrorCode(error, 'NOT_EQUAL_PASSWORDS') && t.errors.invalidPassword2) ||
					(hasErrorCode(error, 'EMAIL_ALREADY_USED') && t.errors.EMAIL_ALREADY_USED) ||
					t.errors.base;
				props.showNotification({
					view: 'error',
					text,
					timeout: true
				});
			})
			.finally(() => {
				setSubmitting(false);
			});
	};

	private _renderProfileSettings = (props: FormikProps<SignupData>): React.ReactNode => {
		const t = this.props.translates;
		return (
			<div className={b('profile')}>
				<Label>{t.name}</Label>
				<Input
					name="firstName"
					size="small"
					autocomplete="off"
					maxLength={30}
					value={props.values.firstName}
					disabled={props.isSubmitting}
					onChange={props.handleChange}
					onBlur={props.handleBlur}
					error={props.touched.firstName && props.errors.firstName && t.errors.invalidFirstname}
				/>
				<Label>{t.surname}</Label>
				<Input
					name="lastName"
					size="small"
					autocomplete="off"
					maxLength={40}
					value={props.values.lastName}
					disabled={props.isSubmitting}
					onChange={props.handleChange}
					onBlur={props.handleBlur}
					error={props.touched.lastName && props.errors.lastName && t.errors.invalidLastname}
				/>
				<Label>{t.email}</Label>
				<Input
					name="email"
					size="small"
					value={props.values.email}
					disabled={props.isSubmitting}
					onChange={props.handleChange}
					onBlur={props.handleBlur}
					error={props.touched.email && props.errors.email && t.errors.invalidEmail}
				/>
				<Label>{t.password}</Label>
				<Input
					name="password"
					autocomplete="off"
					type="password"
					size="small"
					value={props.values.password}
					onChange={props.handleChange}
					onBlur={props.handleBlur}
					error={props.touched.password && props.errors.password && t.errors.passwordValidation}
				/>
				<Label>{t.confirmPassword}</Label>
				<Input
					name="password2"
					autocomplete="off"
					type="password"
					size="small"
					value={props.values.password2}
					onChange={props.handleChange}
					onBlur={props.handleBlur}
					error={props.touched.password2 && props.errors.password2 && t.errors.invalidPassword2}
				/>
				<div className={b('agreement')}>
					<Checkbox name="isAgree" value={props.values.isAgree} setFieldValue={props.setFieldValue}>
						{t.pages.auth.signin.disclaimer[0]}{' '}
						<LinkWrapper
							className={b('link')}
							url="https://assist.video/privacy"
							target="_blank"
							stopPropagation
						>
							{t.pages.auth.signin.disclaimer[1]}
						</LinkWrapper>{' '}
						{t.pages.auth.signin.disclaimer[2]}{' '}
						<LinkWrapper
							className={b('link')}
							url="https://assist.video/terms_of_use"
							target="_blank"
							stopPropagation
						>
							{t.pages.auth.signin.disclaimer[3]}
						</LinkWrapper>
					</Checkbox>
					<ErrorLabel>
						{props.touched.isAgree && props.errors.isAgree && t.errors.invalidAgreement}
					</ErrorLabel>
				</div>
				<div className={b('buttons')}>
					<Button
						type="submit"
						text={t.buttons.send}
						view="primary"
						disabled={!props.dirty || props.isSubmitting}
						onClick={props.handleSubmit}
					/>
					<div>
						<Button text={t.buttons.back} view="invisible" url="/" />
					</div>
				</div>
			</div>
		);
	};

	render(): React.ReactNode {
		const state = this.state;
		return (
			<BackgroundMain>
				<div className={b()}>
					<PageTitle>{this.props.translates.pages.auth.signup.title}</PageTitle>
					<Formik
						initialValues={{...state.user, isAgree: state.isAgree}}
						onSubmit={this._onSubmit}
						validationSchema={SIGNUP_VALIDATION}
						enableReinitialize
					>
						{this._renderProfileSettings}
					</Formik>
				</div>
			</BackgroundMain>
		);
	}
}

export default connect(SignUpPage);
