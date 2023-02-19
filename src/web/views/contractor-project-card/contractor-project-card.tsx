import './contractor-project-card.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import Card from '@/common/views/card/card';
import {Project} from '@/common/types/project';
import IconHot from '../icon-hot/icon-hot';
import IconCommercial from '../icon-commercial/icon-commercial';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import FavoriteView from '../favorite-view/favorite-view';
import SubscriptionBadge from '@/common/views/subscription-badge/subscription-badge';
import {Viewer} from '@/common/types/user';
import composeConnect from '@/common/core/compose/compose';
import AppState from '@/web/state/app-state';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';
import {getLocalePrice} from '@/web/utils/price-utils';

interface StateToProps {
	viewer: Viewer;
}

interface SelfProps {
	project: Project;
	style?: React.CSSProperties;
	bottom?: React.ReactNode;

	openPage?: boolean;
	onClick?: (project: Project) => void;
}

type Props = SelfProps & StateToProps & RouteComponentProps & I18nProps;

const connect = composeConnect<SelfProps, StateToProps, RouteComponentProps, I18nProps>(
	ReactRedux.connect((state: AppState): StateToProps => ({viewer: state.viewer!})),
	withRouter,
	i18nConnect
);

const b = classname('contractor-project-card');

class ContractorProjectCard extends React.PureComponent<Props> {
	private _onClick = (): void => {
		const props = this.props;
		if (props.onClick) {
			props.onClick(props.project);
			return;
		}
		if (props.openPage) {
			props.history.push('/project/' + props.project._id);
		}
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
			return <></>;
		}
		return null;
	};

	private _renderAdditional = (): React.ReactNode => {
		const props = this.props;
		if (!('isFavorite' in props.project)) {
			return null;
		}
		return (
			<div className={b('additional')}>
				<FavoriteView className={b('favorite')} type="Project" subject={props.project} />
			</div>
		);
	};

	render(): React.ReactNode {
		const props = this.props;
		const t = this.props.translates;
		const project = props.project;
		const interactive = props.openPage || Boolean(props.onClick);
		const paycheck = project.paycheck;
		const specialty =
			project.specialties.find((specialty) =>
				props.viewer.specialties?.find((lspec) => lspec._id === specialty._id)
			) || project.specialties[0];
		return (
			<Card
				className={b({interactive})}
				rounded
				shadow
				style={props.style}
				onClick={this._onClick}
				hoverScale={interactive}
			>
				<div className={b('head')}>
					<div className={b('title')}>{project.localeTitle}</div>
					{project.hot ? (
						<div className={b('hot')}>
							<IconHot />
						</div>
					) : null}
					{this._renderAdditional()}
				</div>
				<div className={b('specialty')}>{specialty.title}</div>
				<div className={b('line')} />
				<div className={b('type')}>{project.type.title}</div>
				<div className={b('description')}>{project.localeDescription}</div>

				<div className={b('options')}>
					<div className={b('options-line')}>
						<div className={b('period')}>{t.projectPeriodLabels[project.period]}</div>
						<div className={b('budget')}>
							<div className={b('icon-commercial')}>
								<IconCommercial nonCommercial={project.nonCommercial} />
							</div>
							{project.nonCommercial ? (
								<div className={b('non-commercial')}>{props.translates.nonCommercialProject}</div>
							) : (
								this._renderBudget()
							)}
						</div>
					</div>
					<div className={b('options-line')}>
						<div className={b('premium')}>{project.onlyPremium ? <SubscriptionBadge premium /> : null}</div>
						<div>
							{paycheck.amount ? (
								<>
									<div className={b('budget-item-title')}>{props.translates.payment}</div>
									<div className={b('budget-item-value')}>
										{getLocalePrice(paycheck.amount, paycheck.currency)} /{' '}
										{this.props.translates.paycheckType[paycheck.type]}
									</div>
								</>
							) : null}
						</div>
					</div>
				</div>
				{props.bottom}
			</Card>
		);
	}
}

export default connect(ContractorProjectCard);
