import './user-card-page.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import UserCard from '@/web/views/user-card/user-card';
import UserPage from '../user-page/user-page';
import {Viewer} from '@/common/types/user';
import AppState, {RoleType} from '@/web/state/app-state';
import InviteFriendView from '@/web/views/invite-friend-view/invite-friend-view';
import Button from '../button/button';
import {translates} from '../translates-provider/translates-provider';

interface StateToProps {
	viewer: Viewer;
	role?: RoleType;
}

interface SelfProps {
	children?: React.ReactNode;
}

type ReduxProps = StateToProps;

type Props = SelfProps & ReduxProps;

const connect = ReactRedux.connect(
	(state: AppState): StateToProps => ({
		viewer: state.viewer!,
		role: state.role
	})
);

const b = classname('user-card-page');

class UserCardPage extends React.PureComponent<Props> {
	private _renderLeftSide(): React.ReactNode {
		const props = this.props;
		return (
			<>
				<UserCard viewer={props.viewer} />
				<div className={b('buttons')}>
					{props.role === 'contractor' ? (
						<Button view="dark" text={translates.portfolio} url="/portfolio" roundSize="large" stretched />
					) : null}
					<div className={b('invite-friend')}>
						<InviteFriendView />
					</div>
				</div>
			</>
		);
	}

	render(): React.ReactNode {
		const viewer = this.props.viewer;
		const left = viewer ? this._renderLeftSide() : undefined;
		return <UserPage left={left} hideLeft={!viewer} right={this.props.children} />;
	}
}

export default connect(UserCardPage);
