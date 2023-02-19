import './icon-test.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import SvgIcon from '@/common/views/svg-icon/svg-icon';

import tickIcon from '@/common/icons/tick.svg';

const b = classname('icon-test');

function IconTest() {
	return (
		<div className={b()}>
			<SvgIcon className={b('tick')} url={tickIcon} width={14} height={14} noFill stroke />
		</div>
	);
}

export default IconTest;
