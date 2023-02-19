import './user-card.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import Card from '@/common/views/card/card';
import Avatar from '@/common/views/avatar/avatar';
import {Viewer} from '@/common/types/user';
import Button from '@/common/views/button/button';
import SubscriptionLevel from '@/common/views/subscription-level/subscription-level';
import {TranslatesContext} from '@/common/views/translates-provider/translates-provider';

interface Props {
	viewer: Viewer;
}

const b = classname('user-card');

class UserCard extends React.PureComponent<Props> {
	static contextType = TranslatesContext;
	private _renderHeader = (): React.ReactNode => {
		const viewer = this.props.viewer;
		return (
			<div className={b('header')}>
				<div>
					<Avatar user={viewer} size={64} />
				</div>
				<div className={b('header-info')}>
					<div className={b('viewer-name')}>
						<div>{viewer.localeFirstname}</div>
						<div>{viewer.localeLastname}</div>
					</div>
				</div>
			</div>
		);
	};

	private _renderDescription = (): React.ReactNode => {
		const viewer = this.props.viewer;
		if (!viewer.localeDescription) {
			return null;
		}
		return <div className={b('description')}>{viewer.localeDescription}</div>;
	};

	private _renderLocation = (): React.ReactNode => {
		const viewer = this.props.viewer;
		const location = [viewer.country?.localeName, viewer.city?.localeName].filter(Boolean).join(', ');
		const t = this.context.translates;
		if (!location) {
			return null;
		}
		return (
			<div className={b('location')}>
				<div className={b('location-title')}>{t['location']}</div>
				<div className={b('location-value')}>{location}</div>
			</div>
		);
	};

	private _renderContact = (contact?: string, isUrl?: boolean): React.ReactNode => {
		if (!contact) {
			return null;
		}

		if (isUrl) {
			const url =
				!contact.startsWith('http://') && !contact.startsWith('https://') ? 'https://' + contact : contact;
			return (
				<div className={b('contact')}>
					<a href={url} target="_blank" rel="noreferrer">
						{contact}
					</a>
				</div>
			);
		}
		return <div className={b('contact')}>{contact}</div>;
	};

	private _renderContacts = (): React.ReactNode => {
		const viewer = this.props.viewer;
		const t = this.context.translates;
		if (!viewer.email && !viewer.phone && !viewer.website) {
			return null;
		}
		return (
			<div className={b('contacts')}>
				<div className={b('contacts-header')}>{t['contacts']}</div>
				{this._renderContact(viewer.email)}
				{this._renderContact(viewer.phone)}
				{this._renderContact(viewer.website, true)}
			</div>
		);
	};

	private _renderSubscription = (): React.ReactNode => {
		const viewer = this.props.viewer;
		const subscription = viewer.subscription;
		const stats = viewer.subscriptionStats;
		const date = subscription ? new Date(subscription.end).toLocaleDateString() : undefined;
		const t = this.context.translates;
		return (
			<div className={b('subscription')}>
				<div className={b('subscription-info')}>
					<div className={b('quota')}>
						<div className={b('stat-title')}>{t['available']}</div>
						<div className={b('stat')}>
							{t['projects']}{' '}
							<span>
								<SubscriptionLevel is="premium" else={stats?.quota.projects || 0}>
									{stats?.quota.projects || 0 > 0 ? stats?.quota.projects : '∞'}
								</SubscriptionLevel>
							</span>
						</div>
						<div className={b('stat')}>
							{t['applications']}{' '}
							<span>
								<SubscriptionLevel is="premium" else={stats?.quota.applications || 0}>
									{stats?.quota.projects || 0 > 0 ? stats?.quota.applications : '∞'}
								</SubscriptionLevel>
							</span>
						</div>
						<div className={b('stat')}>
							{t['raiseToTheTop']} <span>{stats?.quota.boosts || 0}</span>
						</div>
					</div>
					<div className={b('total')}>
						<div className={b('stat-title')}>{t['total']}</div>
						<div className={b('stat')}>
							{t['projects']} <span>{stats?.total.projects || 0}</span>
						</div>
						<div className={b('stat')}>
							{t['applications']} <span>{stats?.total.applications || 0}</span>
						</div>
					</div>
				</div>
				<div className={b('subscription-upgrade')}>
					<div className={b('subscription-till')}>
						{date ? (
							<>
								<div>{t['tariffUntil']}</div>
								<div className={b('subscription-till-date')}>{date}</div>
							</>
						) : (
							<div>{t['noTariffSelected']}</div>
						)}
					</div>
					<div className={b('subscription-upgrade-button')}>
						<Button
							text={subscription ? t['prolong'] : t['change']}
							size="small"
							view="primary"
							url="/subscription"
							stretched
						/>
					</div>
				</div>
			</div>
		);
	};

	render(): React.ReactNode {
		return (
			<Card view="dark" rounded="medium">
				<div>
					{this._renderHeader()}
					{this._renderDescription()}
					{this._renderLocation()}
					{this._renderSubscription()}
					{this._renderContacts()}
				</div>
			</Card>
		);
	}
}

export default UserCard;
