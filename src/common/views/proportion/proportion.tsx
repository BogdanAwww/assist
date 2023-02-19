import './proportion.css';

import * as React from 'react';
import classname from '@/common/core/classname';

interface Props {
	w?: number;
	h?: number;

	className?: string;
}

const b = classname('proportion');

const Proportion: React.FC<Props> = ({children, w, h, className}) => {
	const proportion = (((h || 1) / (w || 1)) * 100).toFixed(2);
	return (
		<div className={b()} style={{paddingTop: proportion + '%'}}>
			<div className={[b('wrapper'), className].filter(Boolean).join(' ')}>{children}</div>
		</div>
	);
};

export default Proportion;
