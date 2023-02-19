import './user-recommendations.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import {User} from '@/common/types/user';
import Avatar from '@/common/views/avatar/avatar';

interface Props {
	user: User;
}

const b = classname('user-recommendations');

class UserRecommendations extends React.PureComponent<Props> {
	render(): React.ReactNode {
		const recommendations = this.props.user.recommendations;
		const count = recommendations?.count || 0;
		const users = recommendations?.last || [];
		const firstUsers = users.slice(0, 4);
		const moreCount = count - firstUsers.length;
		return (
			<div className={b()}>
				<div className={b('list')}>
					{firstUsers.map((user, index) => (
						<div className={b('avatar')} key={(user.avatar?.urlTemplate || '') + index}>
							<Avatar user={user} size={32} />
						</div>
					))}
				</div>
				<div className={b('count')}>{moreCount > 0 ? '+' + moreCount : null}</div>
			</div>
		);
	}
}

export default UserRecommendations;
