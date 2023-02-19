import './icon-close.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import SvgIcon from '../svg-icon/svg-icon';

import closeCircleIcon from '@/common/icons/close.svg';

interface Props {
	hoverable?: boolean;
}

const b = classname('icon-close');

class IconClose extends React.PureComponent<Props> {
	render(): React.ReactNode {
		return (
			<div className={b()}>
				<SvgIcon url={closeCircleIcon} width={24} height={24} />
			</div>
		);
	}
}

export default IconClose;
