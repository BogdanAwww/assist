import './badge.css';

import * as React from 'react';
import classname from '@/common/core/classname';

interface Props {
	title: string;
	view?: 'primary' | 'white' | 'gray' | 'yellow' | 'orange' | 'dark';
	size?: 'xs' | 'small' | 'medium' | 'large' | 'xl' | 'xxl';
	selected?: boolean;
	stretched?: boolean;
	disabled?: boolean;

	onClick?: (e: React.MouseEvent) => void;
}

const b = classname('badge');

class Badge extends React.PureComponent<Props> {
	render(): React.ReactNode {
		const props = this.props;
		return (
			<div
				className={b({
					view: props.view || 'primary',
					size: props.size || 'medium',
					selected: props.selected,
					stretched: props.stretched,
					disabled: props.disabled,
					clickable: Boolean(props.onClick)
				})}
				onClick={props.onClick}
			>
				{props.title}
			</div>
		);
	}
}

export default Badge;
export {Props as BadgeProps};
