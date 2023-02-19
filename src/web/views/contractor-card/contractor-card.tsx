import './contractor-card.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import Card from '@/common/views/card/card';
import {User} from '@/common/types/user';
import Avatar from '@/common/views/avatar/avatar';
import FavoriteView from '../favorite-view/favorite-view';
import UserRecommendations from '../user-recommendations/user-recommendations';
import {upperFirst} from 'lodash';
import Warning from '@/common/views/warning/warning';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';

interface SelfProps {
	user: User;
	style?: React.CSSProperties;

	specialties?: string[];

	openPage?: boolean;
	onClick?: (user: User) => void;

	showFavorite?: boolean;
}

type Props = SelfProps & I18nProps;

const b = classname('contractor-card');

const SPECIALTIES_LIMIT = 3;

class ContractorCard extends React.PureComponent<Props> {
	private _onClick = (): void => {
		const props = this.props;
		if (props.onClick) {
			props.onClick(props.user);
			return;
		}
		if (props.openPage) {
			window.open('/profile/' + props.user.username, '_blank');
		}
	};

	private _renderAdditional = (): React.ReactNode => {
		const props = this.props;
		if (!props.showFavorite) {
			return null;
		}
		return (
			<div className={b('additional')}>
				<FavoriteView className={b('favorite')} type="User" subject={props.user} />
			</div>
		);
	};

	private _renderRecommendations = (): React.ReactNode => {
		const user = this.props.user;
		const t = this.props.translates;
		if (!user.recommendations?.count) {
			return null;
		}
		return (
			<div className={b('recommendations')}>
				<div className={b('recommendations-title')}>{t.recommendations}</div>
				<UserRecommendations user={user} />
			</div>
		);
	};

	private _renderBusy = (): React.ReactNode => {
		const user = this.props.user;
		if (!user.busy) {
			return null;
		}
		return (
			<div className={b('busy')}>
				<Warning warning size="xs">
					{this.props.translates.contractorIsBusy}.
				</Warning>
			</div>
		);
	};

	render(): React.ReactNode {
		const props = this.props;
		const t = props.translates;
		const user = props.user;
		const interactive = props.openPage || Boolean(props.onClick);
		const specialties = user.specialties || [];
		const filteredSpecialties = specialties.filter((specialty) => props.specialties?.includes(specialty._id));
		const otherSpecialties = specialties.filter((specialty) => !filteredSpecialties.includes(specialty));
		const showSpecialtiesCount = Math.max(filteredSpecialties.length, SPECIALTIES_LIMIT);
		const shownSpecialties = filteredSpecialties.concat(otherSpecialties).slice(0, showSpecialtiesCount);
		return (
			<Card
				className={b({interactive})}
				rounded
				shadow
				style={props.style}
				onClick={this._onClick}
				hoverScale={interactive}
			>
				<div>
					<div className={b('head')}>
						<div className={b('avatar')}>
							<Avatar user={user} size={64} />
						</div>
						<div className={b('head-info')}>
							<div className={b('name')}>
								{user.localeFirstname}
								<div>{user.localeLastname}</div>
							</div>
						</div>
						{this._renderAdditional()}
					</div>
					<div className={b('specialties')}>
						{shownSpecialties.map((specialty, index, arr) => (
							<span key={specialty._id}>
								<span
									className={b('specialty', {
										active: props.specialties?.includes(specialty._id),
										first: index === 0
									})}
								>
									{index === 0 ? upperFirst(specialty.title) : specialty.title}
								</span>
								{arr.length > 1 && index < arr.length - 1 ? ', ' : ''}
							</span>
						))}
						{showSpecialtiesCount < specialties.length ? (
							<span className={b('specialty', {muted: true})}>
								{' '}
								{t.andMore} {specialties.length - showSpecialtiesCount}
							</span>
						) : null}
					</div>
					{this._renderRecommendations()}
					{this._renderBusy()}
				</div>
			</Card>
		);
	}
}

export default i18nConnect(ContractorCard);
