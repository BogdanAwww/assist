import './invite-friend-view.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import * as Yup from 'yup';
import Button from '@/common/views/button/button';
import Dialog from '@/common/views/dialog/dialog';
import {Formik, FormikHelpers} from 'formik';
import Input from '@/common/views/input/input';
import {inviteFriend} from '@/web/actions/data-provider';
import notificationActions from '@/web/actions/notification-actions';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';

const mapDispatchToProps = {
	showNotification: notificationActions.showNotification
};

const validationSchema = Yup.object().shape({
	email: Yup.string().required('required').email('invalid')
});

interface SelfProps {}

type ReduxProps = typeof mapDispatchToProps;

type Props = SelfProps & ReduxProps & I18nProps;

interface State {
	showDialog?: boolean;
}

const connect = ReactRedux.connect(null, mapDispatchToProps);

const b = classname('invite-friend-view');

class InviteFriendView extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {};
	}

	private _onSubmit = ({email}: {email: string}, {setSubmitting}: FormikHelpers<any>): void => {
		const props = this.props;
		const t = props.translates;
		inviteFriend({email})
			.then((result) => {
				if (result) {
					props.showNotification({
						view: 'success',
						text: t.notifications.inviteSent,
						timeout: true
					});
				} else {
					throw new Error(t.errors.base);
				}
			})
			.catch((error) => {
				props.showNotification({
					view: 'error',
					text: error.message,
					timeout: true
				});
			})
			.finally(() => {
				setSubmitting(false);
			});
	};

	render(): React.ReactNode {
		const t = this.props.translates;
		return (
			<div className={b()}>
				<Button
					view="dark"
					text={t.inviteFriend}
					onClick={() => this.setState({showDialog: true})}
					roundSize="large"
					stretched
				/>
				<Dialog isOpen={this.state.showDialog} onClose={() => this.setState({showDialog: false})} showClose>
					<div className={b('dialog')}>
						<div className={b('dialog-title')}>{t.inviteFriend}</div>
						<Formik<{email: string}>
							initialValues={{email: ''}}
							validationSchema={validationSchema}
							onSubmit={this._onSubmit}
						>
							{(form) => (
								<>
									<Input
										name="email"
										value={form.values.email}
										placeholder={t.enterEmail}
										onChange={form.handleChange}
										onBlur={form.handleBlur}
										disabled={form.isSubmitting}
										error={
											form.touched.email && form.errors.email ? t.errors.invalidEmail : undefined
										}
									/>
									<div className={b('buttons')}>
										<Button
											view="secondary"
											text={t.buttons.cancel}
											onClick={() => this.setState({showDialog: false})}
										/>
										<Button
											type="submit"
											disabled={(form.dirty && !form.isValid) || form.isSubmitting}
											text={t.buttons.invite}
											onClick={form.submitForm}
										/>
									</div>
								</>
							)}
						</Formik>
					</div>
				</Dialog>
			</div>
		);
	}
}

export default connect(i18nConnect(InviteFriendView));
