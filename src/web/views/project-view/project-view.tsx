import './project-view.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import {Project, ProjectReference} from '@/common/types/project';
import Label from '@/common/views/label/label';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import IconHot from '../icon-hot/icon-hot';
import IconCommercial from '../icon-commercial/icon-commercial';
import IconTest from '../icon-test/icon-test';
import LinkWrapper from '@/common/views/link-wrapper/link-wrapper';
import SubscriptionBadge from '@/common/views/subscription-badge/subscription-badge';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';
import {getLocalePrice} from '@/web/utils/price-utils';

import linkIcon from '@/common/icons/link.svg';

interface Props extends I18nProps {
	project: Project;
}

const b = classname('project-view');

class ProjectView extends React.PureComponent<Props> {
	private _renderReference = (ref: ProjectReference): React.ReactNode => {
		const url = ref.example || ref.upload?.url;
		if (!url) {
			return null;
		}
		return (
			<div className={b('reference')} key={url}>
				<LinkWrapper className={b('link')} url={url} target="_blank">
					{ref.description}
					<div className={b('link-icon')}>
						<SvgIcon url={linkIcon} width={10} height={10} />
					</div>
				</LinkWrapper>
			</div>
		);
	};

	private _renderReferencesList = (): React.ReactNode => {
		const t = this.props.translates;
		const references = this.props.project.references;
		if (references.length === 0) {
			return null;
		}
		return (
			<div className={b('references')}>
				<Label text={t.references} />
				<div className={b('references-list')}>{references.map(this._renderReference)}</div>
			</div>
		);
	};

	private _renderProjectFile = (): React.ReactNode => {
		const t = this.props.translates;
		const attachment = this.props.project.attachment;
		if (!attachment) {
			return null;
		}
		return (
			<div className={b('attachment')}>
				<Label text={t.projectFile} />
				<LinkWrapper className={b('link')} url={attachment.url} target="_blank">
					{t.download}
					<div className={b('link-icon')}>
						<SvgIcon url={linkIcon} width={10} height={10} />
					</div>
				</LinkWrapper>
			</div>
		);
	};

	private _renderTest = (): React.ReactNode => {
		const test = this.props.project.test;
		const t = this.props.translates;
		if (!test || (!test.description && !test.file)) {
			return null;
		}
		const fileUrl = test.file?.url;
		const description = test.description;
		return (
			<div className={b('test')}>
				<Label text={t.test} />
				{description ? <div className={b('test-description')}>{description}</div> : null}
				{fileUrl ? (
					<LinkWrapper className={b('link')} url={fileUrl} target="_blank">
						{t.download}
						<div className={b('link-icon')}>
							<SvgIcon url={linkIcon} width={10} height={10} />
						</div>
					</LinkWrapper>
				) : null}
			</div>
		);
	};

	render() {
		const props = this.props;
		const t = props.translates;
		const project = props.project;
		return (
			<div className={b()}>
				<div className={b('header')}>
					{project.hot ? (
						<div className={b('hot')}>
							<IconHot />
						</div>
					) : null}
					<div className={b('type')}>{project.type.title}</div>
					<div className={b('icons')}>
						{project.hasTest ? <IconTest /> : null}
						{project.onlyPremium ? (
							<div className={b('premium')}>
								<SubscriptionBadge premium />
							</div>
						) : null}
						{project.nonCommercial ? (
							<div className={b('non-commercial')}>
								<IconCommercial nonCommercial={project.nonCommercial} />
							</div>
						) : null}
					</div>
				</div>
				<div className={b('separator')} />
				<div className={b('title')}>{project.localeTitle}</div>
				<div className={b('description')}>{project.localeDescription}</div>
				{project.createdAt ? (
					<div className={b('created-at')}>
						{project.status === 'draft'
							? t.draft
							: t.projectPublishedOn.replace('%date', new Date(project.createdAt).toLocaleDateString())}
					</div>
				) : null}
				{project.location ? (
					<div className={b('location')}>
						<Label text={t.location} />
						{project.location?.localeFullName}
					</div>
				) : null}
				<div className={b('specialties')}>
					<Label text={t.projectLookingFor} />
					{project.specialties.map((specialty) => (
						<div className={b('specialty')} key={specialty._id}>
							{specialty.title}
						</div>
					))}
				</div>
				<div className={b('period')}>
					<Label text={t.employmentPeriod} />
					{t.projectPeriodLabels[project.period]}
				</div>
				{project.budget || project.paycheck.amount || project.paycheck.overtime ? (
					<div className={b('budget')}>
						<Label text={t.budget} />
						<div className={b('paycheck-comment')}>{project.paycheck.comment}</div>
						{project.budget ? (
							<div className={b('budget-item')}>
								<div className={b('budget-item-title')}>{t.projectBudget}</div>
								<div className={b('budget-item-value')}>
									{getLocalePrice(project.budget, project.paycheck.currency)}
								</div>
							</div>
						) : null}
						{project.paycheck.amount ? (
							<div className={b('budget-item')}>
								<div className={b('budget-item-title')}>{t.payment}</div>
								<div className={b('budget-item-value')}>
									{getLocalePrice(project.paycheck.amount, project.paycheck.currency)} /{' '}
									{t.paycheckType[project.paycheck.type]}
								</div>
							</div>
						) : null}
						{project.paycheck.overtime ? (
							<div className={b('budget-item')}>
								<div className={b('budget-item-title')}>{t.overtimePayment}</div>
								<div className={b('budget-item-value')}>
									{getLocalePrice(project.paycheck.overtime, project.paycheck.currency)} / {t.hour}
								</div>
							</div>
						) : null}
					</div>
				) : null}
				{this._renderProjectFile()}
				{this._renderReferencesList()}
				{this._renderTest()}
			</div>
		);
	}
}

export default i18nConnect(ProjectView);
