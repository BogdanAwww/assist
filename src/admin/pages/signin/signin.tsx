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
import BackgroundMain from '@/common/views/background-main/background-main';
import {signin} from '@/admin/actions/data-provider';

interface Values {
	login: string;
	password: string;
}

const loginValidationSchema = Yup.object().shape({
	login: Yup.string().email('Некорректный логин').required('Введите логин'),
	password: Yup.string().required('Введите пароль')
});

const mapDispatchToProps = {
	updateViewer: appActions.updateViewer
};

type ReduxProps = typeof mapDispatchToProps;

type Props = ReduxProps & HistoryProps;

const connect = composeConnect<{}, ReduxProps, HistoryProps>(
	ReactRedux.connect(null, mapDispatchToProps),
	historyConnect
);

const b = classname('signin');

class SignInPage extends React.Component<Props> {
	private _onSubmit = (values: Values): Promise<void> => {
		const props = this.props;
		return signin(values).then((viewer) => {
			if (viewer) {
				props.updateViewer(viewer);
				props.history.push('/panel');
			}
		});
	};

	private _renderForm = (): React.ReactNode => {
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
							placeholder="Логин"
							onChange={handleChange}
							onBlur={handleBlur}
							error={touched.login && errors.login}
						/>
						<Input
							name="password"
							type="password"
							value={values.password}
							placeholder="Пароль"
							onChange={handleChange}
							onBlur={handleBlur}
							error={touched.password && errors.password}
						/>
						<div className={b('buttons')}>
							<div>
								<Button type="submit" text="Войти" minWidth />
							</div>
						</div>
					</Form>
				)}
			</Formik>
		);
	};

	render(): React.ReactNode {
		return (
			<BackgroundMain>
				<div className={b()}>
					<div className={b('title')}>Вход</div>
					{this._renderForm()}
				</div>
			</BackgroundMain>
		);
	}
}

export default connect(SignInPage);
