import * as React from 'react';
import {getUser} from '@/web/actions/data-provider';
import {User} from '@/common/types/user';

interface Props {
	username: string;
	onChange?: (user?: User) => void;
}

class UserLoader extends React.PureComponent<Props> {
	componentDidMount() {
		const props = this.props;
		const username = props.username;
		getUser({username}).then((user) => {
			props.onChange?.(user);
		});
	}

	render(): React.ReactNode {
		return null;
	}
}

export default UserLoader;
