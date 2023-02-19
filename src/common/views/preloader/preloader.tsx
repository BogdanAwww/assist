import './preloader.css';

import * as React from 'react';
import classname from '@/common/core/classname';

interface Props {
	size?: 'xs' | 'small' | 'medium' | 'large';
	overlay?: boolean;
}

const b = classname('preloader');

function Preloader(props: Props) {
	return (
		<div
			className={b({
				size: props.size || 'medium',
				overlay: props.overlay
			})}
		>
			<div className={b('inner')}>
				<div />
			</div>
		</div>
	);
}

export default Preloader;
