import './favorite-view.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import {setFavorite} from '@/web/actions/data-provider';
import {User, Viewer} from '@/common/types/user';
import {Project} from '@/common/types/project';
import notificationActions from '@/web/actions/notification-actions';
import AppState from '@/web/state/app-state';

import bookmarkIcon from '@/common/icons/bookmark.svg';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';

const mapDispatchToProps = {
	showNotification: notificationActions.showNotification
};

interface StateToProps {
	viewer: Viewer;
}

interface BaseProps {
	className?: string;
}

interface UserProps {
	type: 'User';
	subject: User;
}

interface ProjectProps {
	type: 'Project';
	subject: Project;
}

type Props = BaseProps & StateToProps & (UserProps | ProjectProps) & typeof mapDispatchToProps & I18nProps;

interface State {
	isFavorite?: boolean;
	savingFavorite?: boolean;
}

const connect = ReactRedux.connect((state: AppState): StateToProps => ({viewer: state.viewer!}), mapDispatchToProps);

const b = classname('favorite-view');

class FavoriteView extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			isFavorite: props.subject.isFavorite
		};
	}

	private _favorite = (e: React.MouseEvent): void => {
		const props = this.props;
		const state = this.state;
		const t = props.translates;
		e.stopPropagation();
		const subscriptionLevel = props.viewer.subscription?.level;
		if (!subscriptionLevel || subscriptionLevel === 'basic') {
			props.showNotification({
				view: 'error',
				text: t.errors.upgradeToPremium,
				timeout: true
			});
			return;
		}
		if (!state.savingFavorite) {
			const isFavorite = state.isFavorite;
			this.setState({savingFavorite: true});
			setFavorite({type: props.type, id: props.subject._id, state: !isFavorite})
				.then(() => {
					this.setState({isFavorite: !isFavorite});
					props.showNotification({
						view: 'success',
						text: isFavorite ? t.bookmarks.deleted : t.bookmarks.added,
						timeout: true
					});
				})
				.finally(() => {
					this.setState({savingFavorite: false});
				});
		}
	};

	render(): React.ReactNode {
		return (
			<div
				className={[b({active: this.state.isFavorite}), this.props.className].filter(Boolean).join(' ')}
				onClick={this._favorite}
			>
				<SvgIcon url={bookmarkIcon} width={20} height={20} />
			</div>
		);
	}
}

export default connect(i18nConnect(FavoriteView));
