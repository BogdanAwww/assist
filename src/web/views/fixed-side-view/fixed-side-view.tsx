import './fixed-side-view.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import AppState from '@/web/state/app-state';

interface StateToProps {
	isMobileLayout?: boolean;
}

interface SelfProps {
	side?: React.ReactNode;
	width?: number;
	children?: React.ReactNode;
	noMargin?: boolean;
}

type Props = SelfProps & StateToProps;

const connect = ReactRedux.connect((state: AppState): StateToProps => ({isMobileLayout: state.isMobileLayout}));

const COLUMN_GUTTER = 32;

const b = classname('fixed-side-view');

class View extends React.PureComponent<Props> {
	render(): React.ReactNode {
		const props = this.props;
		const contentPaddingLeft = props.width ? props.width + COLUMN_GUTTER * 2 : undefined;
		if (props.isMobileLayout) {
			return (
				<>
					{props.side}
					{props.children}
				</>
			);
		}
		return (
			<div className={b({'no-margin': props.noMargin})}>
				<div className={b('side')} style={{width: props.width}}>
					{props.side}
				</div>
				<div className={b('content')} style={{paddingLeft: contentPaddingLeft}}>
					{props.children}
				</div>
			</div>
		);
	}
}

const FixedSideView = connect(View);

export default FixedSideView;
