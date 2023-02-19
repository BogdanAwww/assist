import './card.css';

import React from 'react';
import classname from '@/common/core/classname';

interface Props {
	className?: string;
	view?: 'white' | 'light' | 'dark' | 'gray';
	size?: 'small' | 'medium' | 'large' | 'none';
	onClick?: () => void;
	rounded?: boolean | 'small' | 'medium' | 'large';
	bordered?: boolean;
	shadow?: boolean;
	hoverScale?: boolean;
	style?: React.CSSProperties;
}

const b = classname('card');

class Card extends React.Component<Props> {
	private _onClick = () => {
		this.props.onClick?.();
	};

	render() {
		const props = this.props;
		return (
			<div
				className={[
					b({
						view: props.view || 'white',
						size: props.size || 'small',
						rounded: props.rounded,
						bordered: props.bordered,
						shadow: props.shadow,
						'hover-scale': props.hoverScale
					}),
					props.className
				]
					.filter(Boolean)
					.join(' ')}
				style={props.style}
				onClick={this._onClick}
			>
				{props.children}
			</div>
		);
	}
}

export default Card;
