import './user-view.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import {withRouter, RouteComponentProps} from 'react-router';
import ContractorView from '@/web/views/contractor-view/contractor-view';
import UserLoader from '@/common/views/user-loader/user-loader';
import {User} from '@/common/types/user';
import Button from '@/common/views/button/button';

interface State {
	user?: User;
}

type Props = RouteComponentProps<{username: string}>;

const b = classname('user-view');

class UserViewPage extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {};
	}

	private _onUserLoad = (user?: User): void => {
		this.setState({user});
	};

	private _renderContent = (): React.ReactNode => {
		if (!this.state.user) {
			return null;
		}

		return <ContractorView user={this.state.user} hideActions hideRecommendations hideAdditional />;
	};

	render(): React.ReactNode {
		return (
			<div className={b()}>
				<UserLoader username={this.props.match.params.username} onChange={this._onUserLoad} />
				{this._renderContent()}
				<Button text="Назад" onClick={this.props.history.goBack} />
			</div>
		);
	}
}

export default withRouter(UserViewPage);
