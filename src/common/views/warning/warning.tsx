import './warning.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import IconInfo from '../icon-info/icon-info';

interface Props {
	info?: boolean;
	success?: boolean;
	warning?: boolean;
	error?: boolean;
	margin?: boolean;
	size?: 'xs' | 'small' | 'medium' | 'large';
}

const b = classname('warning');

class Warning extends React.PureComponent<Props> {
	render(): React.ReactNode {
		const props = this.props;
		return (
			<div
				className={b({
					success: props.success,
					warning: props.warning,
					error: props.error,
					margin: props.margin,
					'with-icon': props.info,
					size: props.size || 'small'
				})}
			>
				{props.info ? (
					<div className={b('icon')}>
						<IconInfo />
					</div>
				) : null}
				<div className={b('text')}>{props.children}</div>
			</div>
		);
	}
}

export default Warning;
