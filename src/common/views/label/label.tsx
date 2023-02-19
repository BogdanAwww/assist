import './label.css';

import * as React from 'react';
import classname from '@/common/core/classname';

interface Props {
	text?: React.ReactNode;
	className?: string;
	muted?: boolean;
	red?: boolean;
	required?: boolean;
}

const b = classname('label');

class Label extends React.PureComponent<Props> {
	render(): React.ReactNode {
		const props = this.props;
		const className = [b({muted: props.muted, red: props.red}), props.className].filter(Boolean).join(' ');
		return (
			<div className={className}>
				{props.children || props.text}
				{props.required ? <span className={b('required')}>*</span> : null}
			</div>
		);
	}
}

export default Label;
