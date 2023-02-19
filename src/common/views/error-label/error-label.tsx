import './error-label.css';

import * as React from 'react';
import classname from '@/common/core/classname';

const b = classname('error-label');

class ErrorLabel extends React.PureComponent {
	render(): React.ReactNode {
		const text = this.props.children;
		if (!text) {
			return null;
		}
		return <div className={b()}>{text}</div>;
	}
}

export default ErrorLabel;
