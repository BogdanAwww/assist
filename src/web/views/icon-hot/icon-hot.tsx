import './icon-hot.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import SvgIcon from '@/common/views/svg-icon/svg-icon';

import fireIcon from '@/common/icons/fire.svg';

const b = classname('icon-hot');

function IconHot() {
	return (
		<div className={b()}>
			<SvgIcon url={fireIcon} width={10} height={12} />
		</div>
	);
}

export default IconHot;
