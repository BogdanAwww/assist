import './employer-project-card.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import Card from '@/common/views/card/card';
import {Project} from '@/common/types/project';
import IconHot from '../icon-hot/icon-hot';
import IconCommercial from '../icon-commercial/icon-commercial';
import {getEstimate} from '@/web/utils/date-utils';
import SubscriptionBadge from '@/common/views/subscription-badge/subscription-badge';
import ProjectTypeTitle from '@/web/views/project-type-title/project-type-title';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';
import {getLocalePrice} from '@/web/utils/price-utils';

interface SelfProps {
	project: Project;
	style?: React.CSSProperties;
	bottom?: React.ReactNode;

	onClick?: (project: Project) => void;
}

type Props = SelfProps & I18nProps;

const b = classname('employer-project-card');

class EmployerProjectCard extends React.PureComponent<Props> {
	private _onClick = (): void => {
		const props = this.props;
		props.onClick?.(props.project);
	};

	private _renderBudget = (): React.ReactNode => {
		const project = this.props.project;
		if (project.budget) {
			return (
				<>
					<div className={b('budget-item-title')}>{this.props.translates.budget}</div>
					<div className={b('budget-item-value')}>
						{getLocalePrice(project.budget, project.paycheck.currency)}
					</div>
				</>
			);
		}
		const paycheck = project.paycheck;
		if (paycheck.amount) {
			return (
				<>
					<div className={b('budget-item-title')}>{this.props.translates.payment}</div>
					<div className={b('budget-item-value')}>
						{getLocalePrice(paycheck.amount, paycheck.currency)} /{' '}
						{this.props.translates.paycheckType[paycheck.type]}
					</div>
				</>
			);
		}
		return null;
	};

	render(): React.ReactNode {
		const props = this.props;
		const t = this.props.translates;
		const project = props.project;
		const firstSpecialty = project.specialties[0];
		const estimate = project.applicationEst || 0;
		return (
			<Card
				className={b()}
				rounded
				shadow
				style={props.style}
				onClick={this._onClick}
				hoverScale={Boolean(props.onClick)}
			>
				<div className={b('head')}>
					{firstSpecialty ? <div className={b('specialty')}>{firstSpecialty.title}</div> : null}
					<div className={b('head-line')} />
					<div className={b('period')}>{t.projectPeriodLabels[project.period]}</div>
				</div>
				<div className={b('type')}>
					{project.hot ? <IconHot /> : null}
					<div className={b('type-title')}>
						<ProjectTypeTitle id={project.type.id} />
					</div>
				</div>
				<div className={b('info')}>
					<div className={b('info-head')}>
						<div className={b('title')}>{project.localeTitle}</div>
					</div>
					<div className={b('options')}>
						{project.onlyPremium ? (
							<div className={b('premium')}>
								<SubscriptionBadge premium />
							</div>
						) : null}
						<div className={b('icon-commercial')}>
							<IconCommercial nonCommercial={project.nonCommercial} />
						</div>
						{project.nonCommercial ? (
							<div className={b('non-commercial')}>{t.nonCommercialProject}</div>
						) : (
							this._renderBudget()
						)}
					</div>
				</div>
				<div className={b('applications')}>
					<div className={b('applications-title')}>{t.applications}</div>
					<div className={b('applications-info')}>
						<div className={b('applications-new')}>
							{t.newMany} <span>{project.applicationsCounter?.unread || 0}</span>
						</div>
						<div className={b('applications-separator')} />
						<div className={b('applications-seen')}>
							{t.seen} <span>{project.applicationsCounter?.seen || 0}</span>
						</div>
					</div>
				</div>
				<div className={b('footer')}>
					<div className={b('term')}>{t.applicationTime}</div>
					<div className={b('footer-line')} />
					<div className={b('est')}>
						{project.endDate ? (
							<>
								<div className={b('est-title')}>{estimate > 0 ? t.estimate : t.finished}</div>
								{estimate > 0 ? <span>{getEstimate(estimate)}</span> : null}
							</>
						) : (
							t.termless
						)}
					</div>
				</div>
				{props.bottom}
			</Card>
		);
	}
}

export default i18nConnect(EmployerProjectCard);
