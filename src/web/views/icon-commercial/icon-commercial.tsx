import './icon-commercial.css';

import SvgIcon from '@/common/views/svg-icon/svg-icon';
import * as React from 'react';
import classname from '@/common/core/classname';

import dollarIcon from '@/common/icons/dollar.svg';
import dollarCrossedIcon from '@/common/icons/dollar-crossed.svg';

interface Props {
	nonCommercial?: boolean;
}

const b = classname('icon-commercial');

function IconCommercial(props: Props): React.ReactElement {
	return (
		<SvgIcon
			className={b({crossed: props.nonCommercial})}
			url={props.nonCommercial ? dollarCrossedIcon : dollarIcon}
			noFill
			width={16}
			height={16}
		/>
	);
}

export default IconCommercial;
