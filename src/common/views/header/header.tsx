import './header.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import Logo from '@/common/views/logo/logo';

interface Props {
	smallLogo?: boolean;
	logoUrl?: string;
}

const b = classname('header');

class Header extends React.PureComponent<Props> {
	render(): React.ReactNode {
		const props = this.props;
		return (
			<div className={b()}>
				<div className={b('left')}>
					<div className={b('logo')}>
						<a href={props.logoUrl || '/'} target="_self">
							<Logo size={props.smallLogo ? 'small' : undefined} />
						</a>
					</div>
					<div className={b('title')} />
				</div>
				<div className={b('right')}>{this.props.children}</div>
			</div>
		);
	}
}

export default Header;
