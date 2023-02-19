import './contractor-view.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import {User, Viewer} from '@/common/types/user';
import Avatar from '@/common/views/avatar/avatar';
import FavoriteView from '../favorite-view/favorite-view';
import UserRecommendations from '../user-recommendations/user-recommendations';
import Button from '@/common/views/button/button';
import Hint from '@/common/views/hint/hint';
import {recommendUser} from '@/web/actions/data-provider';
import AppState, {RoleType} from '@/web/state/app-state';
import Warning from '@/common/views/warning/warning';
import chatActions from '@/web/actions/chat-actions';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';

const mapDispatchToProps = {
	openUserChat: chatActions.openUserChat
};

interface StateToProps {
	viewer?: Viewer;
	role?: RoleType;
	isMobileLayout?: boolean;
}

interface SelfProps {
	user: User;
	hideActions?: boolean;
	hideRecommendations?: boolean;
	hideAdditional?: boolean;
}

type Props = SelfProps & StateToProps & typeof mapDispatchToProps & I18nProps;

interface State {
	user: User;
}

const connect = ReactRedux.connect(
	(state: AppState): StateToProps => ({viewer: state.viewer, role: state.role, isMobileLayout: state.isMobileLayout}),
	mapDispatchToProps
);

const b = classname('contractor-view');

class ContractorView extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			user: props.user
		};
	}

	private _recommend = (): void => {
		recommendUser({id: this.state.user._id}).then((result) => {
			const user = this.state.user;
			this.setState({
				user: {
					...user,
					recommendations: result || user.recommendations,
					isRecommended: Boolean(result)
				}
			});
		});
	};

	private _sendMessage = (): void => {
		const props = this.props;
		props.openUserChat(props.user);
	};

	private _renderActions = (): React.ReactNode => {
		const props = this.props;
		if (!props.viewer || props.viewer._id === this.state.user._id || props.hideActions) {
			return null;
		}
		const t = props.translates;
		const user = this.state.user;
		return (
			<div className={b('actions')}>
				{props.role === 'employer' ? (
					<div className={b('invite')}>
						<Button
							view="bordered-red"
							text={t.inviteToProject}
							disabled={user.busy}
							url={`/profile/${user.username}/invite`}
						/>
					</div>
				) : null}
				<div className={b('message')}>
					<Button text={t.buttons.message} disabled={user.busy} onClick={this._sendMessage} />
				</div>
			</div>
		);
	};

	private _renderLocation = (): React.ReactNode => {
		const user = this.state.user;
		const location = [user.country?.localeName, user.city?.localeName].filter(Boolean).join(', ');
		if (!location) {
			return null;
		}
		return (
			<div className={b('block')}>
				<div className={b('block-title')}>{this.props.translates.location}</div>
				<div className={b('location')}>{location}</div>
			</div>
		);
	};

	private _renderSpecialties = (): React.ReactNode => {
		const specialties = this.state.user.specialties || [];
		return (
			<div className={b('block')}>
				<div className={b('block-title')}>{this.props.translates.speciality}</div>
				<div className={b('specialties')}>
					{specialties.map((specialty) => (
						<div className={b('specialty')} key={specialty._id}>
							{specialty.title}
						</div>
					))}
				</div>
			</div>
		);
	};

	private _renderContact = (contact?: string, protocol?: string, isUrl?: boolean): React.ReactNode => {
		if (!contact) {
			return null;
		}

		if (isUrl) {
			let url = contact;
			if (protocol === 'tel:') {
				url = contact.replace(/\s/gi, '');
			}
			return (
				<div className={b('contact')}>
					<a className={b('link')} href={(protocol || '') + url} target="_blank" rel="noreferrer">
						{contact}
					</a>
				</div>
			);
		}
		return <div className={b('contact')}>{contact}</div>;
	};

	private _renderContacts = (): React.ReactNode => {
		const user = this.state.user;
		if (user.busy) {
			return this._renderBusy();
		}
		if (!user.email && !user.phone && !user.website) {
			return null;
		}
		const isMobile = this.props.isMobileLayout;
		const websitePrefix =
			user.website && !user.website.startsWith('http://') && !user.website.startsWith('https://')
				? 'https://'
				: undefined;
		return (
			<div className={b('block')}>
				<div className={b('block-title')}>{this.props.translates.contacts}</div>
				{this._renderContact(user.email, isMobile ? 'mailto:' : undefined, isMobile)}
				{this._renderContact(user.phone, isMobile ? 'tel:' : undefined, isMobile)}
				{this._renderContact(user.website, websitePrefix, true)}
			</div>
		);
	};

	private _renderAdditional = (): React.ReactNode => {
		const user = this.state.user;
		const viewer = this.props.viewer;
		if (!('isFavorite' in user) || !viewer || viewer?.username === user.username || this.props.hideAdditional) {
			return null;
		}
		return (
			<div className={b('additional')}>
				<FavoriteView className={b('favorite')} type="User" subject={user} />
			</div>
		);
	};

	private _renderRecommendations = (): React.ReactNode => {
		const user = this.state.user;
		const viewer = this.props.viewer;
		const canShowButton = Boolean(viewer && viewer.username !== user.username);
		const hasRecs = Boolean(user.recommendations?.count);
		if ((!hasRecs && !canShowButton) || this.props.hideRecommendations) {
			return null;
		}
		const t = this.props.translates;
		return (
			<div className={b('block')}>
				<div className={b('block-title')}>{t.recommendations}</div>
				<div className={b('recommendations')}>
					<div className={b('recommendations-list')}>
						<UserRecommendations user={user} />
					</div>
					{canShowButton ? (
						<div className={b('recommendations-button')}>
							<Hint position="top" content={user.isRecommended ? t.errors.alreadyRecommended : undefined}>
								<Button
									view="dark"
									disabled={user.isRecommended}
									onClick={this._recommend}
									text={t.buttons.recommend}
								/>
							</Hint>
						</div>
					) : null}
				</div>
			</div>
		);
	};

	private _renderBusy = (): React.ReactNode => {
		const user = this.state.user;
		if (!user.busy) {
			return null;
		}
		return (
			<Warning warning margin>
				{this.props.translates.contractorIsBusy}
			</Warning>
		);
	};

	render(): React.ReactNode {
		const state = this.state;
		const user = state.user;
		return (
			<div className={b()}>
				<div className={b('head')}>
					<Avatar user={user} size={64} show={Boolean(this.props.viewer)} />
					<div className={b('name')}>
						<div>{user.localeFirstname}</div>
						<div>{user.localeLastname}</div>
					</div>
					{this._renderAdditional()}
				</div>
				{this._renderActions()}
				<div className={b('block', {description: true})}>{user.localeDescription}</div>
				{this._renderLocation()}
				{this._renderSpecialties()}
				{this._renderRecommendations()}
				{this._renderContacts()}
			</div>
		);
	}
}

export default connect(i18nConnect(ContractorView));
