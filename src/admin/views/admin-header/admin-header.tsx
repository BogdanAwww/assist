import './admin-header.css';

import React from 'react';
import classname from '@/common/core/classname';
import historyConnect, {HistoryProps} from '@/common/utils/history-connect';
import Header from '@/common/views/header/header';
import SvgIcon from '@/common/views/svg-icon/svg-icon';

import logoutIcon from '@/common/icons/logout.svg';

const b = classname('admin-header');

class AdminHeader extends React.Component<HistoryProps> {
	render() {
		const history = this.props.history;
		return (
			<Header>
				<div className={b('icons')}>
					<div className={b('icon-button')} onClick={() => history.push('/signout')}>
						<SvgIcon url={logoutIcon} width={20} height={20} />
					</div>
				</div>
			</Header>
		);
	}
}

export default historyConnect(AdminHeader);
