import './icon-info.css';

import * as React from 'react';
import SvgIcon from '../svg-icon/svg-icon';
import classname from '@/common/core/classname';

import infoIcon from '@/common/icons/info.svg';

interface Props {
	size?: 'small' | 'medium';
	margin?: boolean;
	error?: boolean;
}

const b = classname('icon-info');

const ICON_SIZES = {
	small: 12,
	medium: 14
} as const;

class IconInfo extends React.PureComponent<Props> {
	render(): React.ReactNode {
		const props = this.props;
		const size = ICON_SIZES[props.size || 'medium'];
		return (
			<SvgIcon
				className={b({margin: props.margin, error: props.error})}
				url={infoIcon}
				width={size}
				height={size}
			/>
		);
	}
}

export default IconInfo;
