import './logo.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import SvgIcon from '../svg-icon/svg-icon';
import logoUrl from './images/logo.svg';

interface Props {
	size?: 'small' | 'medium';
}

const b = classname('logo');

class Logo extends React.PureComponent<Props> {
	render() {
		return <SvgIcon className={b({size: this.props.size || 'medium'})} url={logoUrl} noFill />;
	}
}

export default Logo;
