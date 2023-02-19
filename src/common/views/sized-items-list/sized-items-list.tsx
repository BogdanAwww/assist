import './sized-items-list.css';

import classname from '@/common/core/classname';
import * as React from 'react';
import ResizeListener from '../resize-listener/resize-listener';
import {PaginationInfo} from '@/common/types';
import Pagination from '../pagination/pagination';

interface Props {
	className?: string;
	gutter?: number;
	limits?: Record<number, number>;
	emptyMessage?: string;
	pageInfo?: PaginationInfo;
	onPageChange?: (value: number) => void;
}

interface State {
	width?: number | string;
}

const LIST_LIMITS = {
	480: 2,
	720: 3,
	1024: 4,
	1600: 5
};

const b = classname('sized-items-list');

class SizedItemsList extends React.PureComponent<Props, State> {
	private _ref = React.createRef<HTMLDivElement>();

	constructor(props: Props) {
		super(props);

		this.state = {};
	}

	componentDidMount() {
		this._onResize();
	}

	private _onResize = (e?: WindowEventMap['resize']): void => {
		const props = this.props;
		const limits = props.limits || LIST_LIMITS;
		const target = e?.target as Window;
		const gutter = props.gutter || 0;
		const wholeWidth = target?.innerWidth || this._ref.current?.offsetWidth || 0;
		const width = wholeWidth - gutter;
		let count = 1;
		for (const key in limits) {
			const checkWidth = Number(key);
			if (checkWidth < width) {
				count = limits[key];
			}
		}
		const widthSingle = (width - (count - 1) * gutter) / count;
		this.setState({
			// width: (widthSingle / wholeWidth * 100).toFixed(2) + '%'
			width: widthSingle + 'px'
		});
	};

	private _renderPagination = (): React.ReactNode => {
		const props = this.props;
		const pageInfo = props.pageInfo;
		if (!pageInfo || !props.onPageChange) {
			return null;
		}
		return (
			<div className={b('pagination')}>
				<Pagination value={pageInfo.currentPage} max={pageInfo.pageCount} onChange={props.onPageChange} />
			</div>
		);
	};

	render(): React.ReactNode {
		const props = this.props;
		const width = this.state.width;
		const className = [b(), props.className].filter(Boolean).join(' ');
		const gutter = props.gutter;
		const children = React.Children.toArray(props.children);
		const marginStyle = gutter ? `${-gutter / 2}px` : '';
		return (
			<div className={className} style={{marginLeft: marginStyle, marginRight: marginStyle}} ref={this._ref}>
				{children.map((child: React.ReactElement) =>
					child
						? React.cloneElement(child, {
								...child.props,
								style: {
									width,
									marginLeft: gutter && gutter / 2,
									marginRight: gutter && gutter / 2,
									marginBottom: gutter,
									flexGrow: 0,
									flexShrink: 0
								}
						  })
						: null
				)}
				{props.emptyMessage && children.length === 0 ? (
					<div className={b('empty')}>{props.emptyMessage}</div>
				) : null}
				{this._renderPagination()}
				<ResizeListener onResize={this._onResize} />
			</div>
		);
	}
}

export default SizedItemsList;
