import {User} from '@/common/types/user';
import {getUser} from '@/web/actions/data-provider';
import * as React from 'react';

interface ChildrenProps {
	user?: User;
	isLoading?: boolean;
}

interface Props {
	username?: string;
	children: (props: ChildrenProps) => React.ReactNode;
}

interface State {
	user?: User;
	isLoading?: boolean;
}

class GetUserView extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {};
	}

	componentDidMount() {
		this._load();
	}

	componentDidUpdate(props: Props) {
		if (props.username !== this.props.username) {
			this._load();
		}
	}

	private _load = (): void => {
		const username = this.props.username;
		if (username) {
			this.setState({isLoading: true});
			getUser({username}, {fetchPolicy: 'cache-first'})
				.then((user) => this.setState({user}))
				.finally(() => this.setState({isLoading: false}));
		}
	};

	render(): React.ReactNode {
		return this.props.children(this.state);
	}
}

export default GetUserView;
