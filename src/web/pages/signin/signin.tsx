import './signin.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import appActions from '@/web/actions/app-actions';
import composeConnect from '@/common/core/compose/compose';
import historyConnect, {HistoryProps} from '@/common/utils/history-connect';
import {Formik} from 'formik';
import * as Yup from 'yup';
import Form from '@/common/views/form/form';
import Button from '@/common/views/button/button';
import Input from '@/common/views/input/input';
import LinkWrapper from '@/common/views/link-wrapper/link-wrapper';
import BackgroundMain from '@/common/views/background-main/background-main';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import {signin} from '@/web/actions/data-provider';
import notificationActions from '@/web/actions/notification-actions';
import {hasErrorCode} from '@/common/core/apollo-client/errors';
import config from '@/web/config';
import Dialog from '@/common/views/dialog/dialog';

import facebookIcon from './icons/facebook.svg';
import googleIcon from './icons/google.svg';
import PageTitle from '@/web/views/page-title/page-title';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';

interface Values {
	login: string;
	password: string;
}

const loginValidationSchema = Yup.object().shape({
	login: Yup.string().required('required'),
	password: Yup.string().required('required')
});

const mapDispatchToProps = {
	updateViewer: appActions.updateViewer,
	showNotification: notificationActions.showNotification
};

type ReduxProps = typeof mapDispatchToProps;

type Props = ReduxProps & HistoryProps & I18nProps;

interface State {
	showDialog: boolean;
	service: string;
}

const connect = composeConnect<{}, ReduxProps, HistoryProps>(
	ReactRedux.connect(null, mapDispatchToProps),
	historyConnect
);

const b = classname('signin');

class SignInPage extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			showDialog: false,
			service: ''
		};
	}

	componentDidMount() {
		const props = this.props;
		const search = (props.history.location?.search?.slice(1) || '').split('&').map((item) => item.split('='));
		const [, error] = search.find((item) => item[0] === 'error') || [];
		if (error) {
			const text = error === 'no-email' ? props.translates.errors.socialAuthError : props.translates.errors.base;
			props.showNotification({
				view: 'error',
				text,
				timeout: true
			});
		}
	}

	private _facebook = () => {
		window.location.href = config.api + '/facebook/auth';
	};

	private _google = () => {
		window.location.href = config.api + '/google/auth';
	};

	private _onSubmit = (values: Values): Promise<void> => {
		const props = this.props;
		const t = props.translates;
		const role = localStorage.getItem('role');
		return signin(values)
			.then((viewer) => {
				if (viewer) {
					props.updateViewer(viewer);
					props.history.push('/choose-role');
				}
				if (role && role === 'employer') {
					props.history.push('/projects');
				}
			})
			.catch((error) => {
				if (hasErrorCode(error, 'UNAUTHENTICATED')) {
					props.showNotification({
						view: 'error',
						text: t.errors.UNAUTHENTICATED,
						timeout: true
					});
				} else if (hasErrorCode(error, 'ALREADY_LOGGED')) {
					return;
				} else if (hasErrorCode(error, 'RATE_LIMIT')) {
					props.showNotification({
						view: 'error',
						text: t.errors.RATE_LIMIT,
						timeout: true
					});
				} else {
					props.showNotification({
						view: 'error',
						text: t.errors.base,
						timeout: true
					});
				}
			});
	};

	private _renderUserAgreementsDialog = (): React.ReactNode => {
		const t = this.props.translates;
		const closeDialog = () => {
			this.setState({showDialog: false});
		};

		const redirectTo = () => {
			if (this.state.service === 'google') {
				this._google();
			} else {
				this._facebook();
			}
		};

		return (
			<Dialog isOpen={this.state.showDialog} onClose={closeDialog} showClose overlayClose>
				<div className={b('dialog__wrapper')}>
					<div className={b('dialog__agreements')}>
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
					</div>
					<Button className={b('dialog__button')} text={t.buttons.continue} onClick={redirectTo} />
				</div>
			</Dialog>
		);
	};

	private _renderForm = (): React.ReactNode => {
		const t = this.props.translates;
		return (
			<Formik
				initialValues={{login: '', password: ''}}
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
						<Input
							name="password"
							type="password"
							value={values.password}
							placeholder={t.password}
							onChange={handleChange}
							onBlur={handleBlur}
							error={touched.password && errors.password ? t.errors.invalidPassword : undefined}
						/>
						<div className={b('forgot-password')}>
							<LinkWrapper url="/forgot-password">{t.pages.auth.signin.forgotPassword}</LinkWrapper>
						</div>
						<div className={b('buttons')}>
							<div>
								<Button type="submit" text={t.buttons.enter} minWidth />
							</div>
							<div className={b('signup')}>
								<Button view="invisible" text={t.buttons.createAccount} url="/signup" minWidth />
							</div>
						</div>
					</Form>
				)}
			</Formik>
		);
	};

	render(): React.ReactNode {
		const t = this.props.translates;
		return (
			<BackgroundMain>
				<div className={b()}>
					<PageTitle>{t.pages.auth.signin.title}</PageTitle>
					<div className={b('auth-with')}>
						<div className={b('auth-with-title')}>{t.pages.auth.signin.authWith}</div>
						<div className={b('auth-with-buttons')}>
							<div
								className={b('auth-with-button')}
								onClick={() => this.setState({showDialog: true, service: 'facebook'})}
							>
								<SvgIcon url={facebookIcon} noFill />
							</div>
							<div
								className={b('auth-with-button')}
								onClick={() => this.setState({showDialog: true, service: 'google'})}
							>
								<SvgIcon url={googleIcon} noFill />
							</div>
						</div>
					</div>
					<div className={b('or')}>
						<div className={b('or-text')}>{t.pages.auth.signin.or}</div>
					</div>
					{this._renderForm()}
					{this._renderUserAgreementsDialog()}
				</div>
			</BackgroundMain>
		);
	}
}

export default connect(i18nConnect(SignInPage));
