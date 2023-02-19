import './project-apply.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import composeConnect from '@/common/core/compose/compose';
import {Project, ProjectApply} from '@/common/types/project';
import {Formik, FormikHelpers} from 'formik';
import {getProject, projectApply} from '@/web/actions/data-provider';
import Preloader from '@/common/views/preloader/preloader';
import Label from '@/common/views/label/label';
import Textarea from '@/common/views/textarea/textarea';
import Input from '@/common/views/input/input';
import FixedSideView from '@/web/views/fixed-side-view/fixed-side-view';
import Button from '@/common/views/button/button';
import IconTest from '@/web/views/icon-test/icon-test';
import notificationActions from '@/web/actions/notification-actions';
import Card from '@/common/views/card/card';
import {hasErrorCode} from '@/common/core/apollo-client/errors';
import Dialog from '@/common/views/dialog/dialog';
import PageTitle from '@/web/views/page-title/page-title';
import {Viewer} from '@/common/types/user';
import AppState from '@/web/state/app-state';
import Warning from '@/common/views/warning/warning';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';
import {getCurrency} from '@/web/utils/price-utils';

const initialValues: ProjectApply = {
	description: '',
	links: ['', '', ''],
	budget: 0,
	shiftCost: 0
};

const mapDispatchToProps = {
	showNotification: notificationActions.showNotification
};

interface StateToProps {
	viewer: Viewer;
}

type ReduxProps = StateToProps & typeof mapDispatchToProps;

interface SelfProps {}

type Props = SelfProps & ReduxProps & RouteComponentProps<{id: string}> & I18nProps;

interface State {
	project?: Project;
	success?: boolean;
	showSubscriptionDialog: boolean;
}

const connect = composeConnect<SelfProps, ReduxProps, RouteComponentProps, I18nProps>(
	ReactRedux.connect((state: AppState): StateToProps => ({viewer: state.viewer!}), mapDispatchToProps),
	withRouter,
	i18nConnect
);

const b = classname('project-apply-page');

class ProjectApplyPage extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			showSubscriptionDialog: false
		};
	}

	componentDidMount() {
		const props = this.props;
		const id = props.match.params.id;
		if (id) {
			getProject(id).then((project) => {
				this.setState({project});
			});
		} else {
			props.history.push('/search');
		}
	}

	private _onSubmit = (values: ProjectApply, {setSubmitting}: FormikHelpers<ProjectApply>): void => {
		const props = this.props;
		const id = props.match.params.id;
		projectApply({id, input: values})
			.then((application) => {
				if (application) {
					this.setState({success: true});
				} else {
					props.showNotification({
						view: 'error',
						text: props.translates.errors.base,
						timeout: true
					});
				}
			})
			.catch((error) => {
				if (hasErrorCode(error, 'QUOTA_EXCEEDED')) {
					this.setState({showSubscriptionDialog: true});
				}
				if (hasErrorCode(error, 'ALREADY_APPLIED')) {
					props.showNotification({
						view: 'error',
						text: props.translates.errors.ALREADY_APPLIED,
						timeout: true
					});
				}
				if (hasErrorCode(error, 'EMPTY_PORTFOLIO')) {
					props.showNotification({
						view: 'error',
						text: props.translates.errors.EMPTY_PORTFOLIO,
						timeout: true
					});
				}
			})
			.finally(() => {
				setSubmitting(false);
			});
	};

	private _renderForm = (): React.ReactNode => {
		const props = this.props;
		const t = props.translates;
		const state = this.state;
		const project = state.project!;
		if (state.success) {
			return this._renderSuccess();
		}
		return (
			<Formik initialValues={initialValues} onSubmit={this._onSubmit}>
				{(form) => (
					<>
						<PageTitle>{t.application}</PageTitle>
						<Label text={t.pages.contractor.project.apply.whyMe} />
						<Textarea
							name="description"
							size="small"
							rows={5}
							value={form.values.description}
							disabled={form.isSubmitting}
							onChange={form.handleChange}
							onBlur={form.handleBlur}
							maxlength={200}
							error={form.touched.description && form.errors.description}
						/>
						{project.hasTest ? (
							<div className={b('test-disclaimer')}>
								<div className={b('test-icon')}>
									<IconTest />
								</div>
								<div>
									<div className={b('test-title')}>{t.pages.contractor.project.apply.hasTest}</div>
									<div className={b('test-text')}>
										{t.pages.contractor.project.apply.hasTestDisclaimer}
									</div>
								</div>
							</div>
						) : null}
						<Label text={t.pages.contractor.project.apply.lastWorks} />
						<div className={b('works-disclaimer')}>
							{t.pages.contractor.project.apply.lastWorksDisclaimer}
						</div>
						<Input
							name="links.0"
							size="small"
							placeholder={t.pages.contractor.project.apply.link}
							value={form.values.links[0]}
							disabled={form.isSubmitting}
							onChange={form.handleChange}
							onBlur={form.handleBlur}
							// error={form.touched.links && form.errors.links}
						/>
						<Input
							name="links.1"
							size="small"
							placeholder={t.pages.contractor.project.apply.link}
							value={form.values.links[1]}
							disabled={form.isSubmitting}
							onChange={form.handleChange}
							onBlur={form.handleBlur}
							// error={form.touched.links && form.errors.links}
						/>
						<Input
							name="links.2"
							size="small"
							placeholder={t.pages.contractor.project.apply.link}
							value={form.values.links[2]}
							disabled={form.isSubmitting}
							onChange={form.handleChange}
							onBlur={form.handleBlur}
							// error={form.touched.links && form.errors.links}
						/>
						<Label text={t.payment + ` (${getCurrency(project.paycheck.currency)})`} />
						<Input
							name="shiftCost"
							type="number"
							size="small"
							value={form.values.shiftCost}
							disabled={form.isSubmitting}
							onChange={form.handleChange}
							onBlur={form.handleBlur}
						/>
						{!props.viewer.hasPortfolio ? (
							<Warning error margin>
								{t.pages.contractor.project.apply.fillPortfolio}
							</Warning>
						) : null}
						<div className={b('buttons')}>
							{props.history.length > 1 ? (
								<Button view="secondary" text={t.buttons.back} onClick={props.history.goBack} />
							) : null}
							<Button
								text={t.buttons.send}
								disabled={!props.viewer.hasPortfolio}
								onClick={form.submitForm}
							/>
						</div>
					</>
				)}
			</Formik>
		);
	};

	private _renderSuccess = (): React.ReactNode => {
		const project = this.state.project!;
		const t = this.props.translates;
		return (
			<div className={b('success')}>
				<Card view="dark" rounded>
					<div className={b('success-card')}>{t.pages.contractor.project.apply.success}</div>
				</Card>
				<div className={b('success-title')}>{project.localeTitle}</div>
				<div className={b('success-description')}>{project.localeDescription}</div>
				<div className={b('success-buttons')}>
					<Button text={t.buttons.continueSearch} url="/search" minWidth />
					<div className={b('my-applications')}>
						<Button view="invisible" text={t.myApplications} url="/applications" minWidth />
					</div>
				</div>
			</div>
		);
	};

	private _renderDialog = (): React.ReactNode => {
		const t = this.props.translates;
		return (
			<Dialog
				isOpen={this.state.showSubscriptionDialog}
				onClose={() => this.setState({showSubscriptionDialog: false})}
				overlayClose
				showClose
			>
				<div className={b('subscription-dialog')}>
					<PageTitle>{t.pages.contractor.project.apply.declined}</PageTitle>
					<div className={b('dialog-text')}>{t.pages.contractor.project.apply.exceededDisclaimer}</div>
					<div className={b('dialog-button')}>
						<Button text={t.buttons.open} url="/subscription" />
					</div>
				</div>
			</Dialog>
		);
	};

	render(): React.ReactNode {
		const state = this.state;
		const project = state.project;
		if (!project) {
			return <Preloader overlay />;
		}
		return (
			<div className={b()}>
				<FixedSideView side={this._renderForm()} />
				{this._renderDialog()}
			</div>
		);
	}
}

export default connect(ProjectApplyPage);
