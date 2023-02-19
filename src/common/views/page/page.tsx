import './page.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import Footer from '../footer/footer';

interface Props {
	header?: React.ReactNode;
	fill?: boolean;
	padding?: boolean;
	staticFooter?: boolean;
	hideFooter?: boolean;
}

const b = classname('page');

class Page extends React.Component<Props> {
	render() {
		const props = this.props;
		return (
			<div
				className={b({
					fill: props.fill,
					'with-header': Boolean(props.header),
					padding: props.padding,
					'static-footer': props.staticFooter
				})}
			>
				{props.header}
				<div className={b('content')}>{props.children}</div>
				<Footer static={props.staticFooter} hide={props.hideFooter} />
			</div>
		);
	}
}

export default Page;
