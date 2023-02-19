import './page-title.css';

import * as React from 'react';
import classname from '@/common/core/classname';

interface Props {
	red?: boolean;
	noMargin?: boolean;
	className?: string;
}

const b = classname('page-title');

class PageTitle extends React.PureComponent<Props> {
	render() {
		const props = this.props;
		return (
			<div
				className={[
					b({
						red: props.red,
						'no-margin': props.noMargin
					}),
					props.className
				]
					.filter(Boolean)
					.join(' ')}
			>
				{props.children}
			</div>
		);
	}
}

export default PageTitle;
