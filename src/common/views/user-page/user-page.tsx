import './user-page.css';

import * as React from 'react';
import classname from '@/common/core/classname';

interface Props {
	left: React.ReactNode;
	right: React.ReactNode;
	hideLeft?: boolean;
}

const b = classname('user-page');

class UserPage extends React.Component<Props> {
	render() {
		const props = this.props;
		return (
			<div className={b({'hide-left': props.hideLeft})}>
				<div className={b('user-column')}>{props.left}</div>
				<div className={b('page-content')}>{props.right}</div>
			</div>
		);
	}
}

export default UserPage;
