import './items-list.css';

import classname from '@/common/core/classname';
import * as React from 'react';
import {PaginationOutput} from '@/common/types';
import Pagination from '../pagination/pagination';
import {withRouter, RouteComponentProps} from 'react-router';

interface SelfProps<T, C> {
	className?: string;
	emptyMessage?: string;
	data?: PaginationOutput<T, C>;
	loadPage?: (value: number) => void;
	children?: (item: T, index: number, array: T[]) => React.ReactNode;
}

type Props<T, C> = SelfProps<T, C> & RouteComponentProps;

interface State {}

const b = classname('items-list');

class View<T, C = number> extends React.PureComponent<Props<T, C>, State> {
	private _ref = React.createRef<HTMLDivElement>();

	constructor(props: Props<T, C>) {
		super(props);

		this.state = {};
	}

	componentDidMount() {
		const page = new URLSearchParams(this.props.location.search).get('page') || '';
		this.props.loadPage?.(parseInt(page) || 1);
	}

	private _onChange = (page: number): void => {
		const props = this.props;
		props.history.replace(props.history.location.pathname + '?' + new URLSearchParams({page: page.toString()}));
		props.loadPage?.(page);
	};

	private _renderPagination = (): React.ReactNode => {
		const props = this.props;
		const pageInfo = props.data?.pageInfo;
		if (!pageInfo || !props.loadPage) {
			return null;
		}
		return (
			<div className={b('pagination')}>
				<Pagination value={pageInfo.currentPage} max={pageInfo.pageCount} onChange={this._onChange} />
			</div>
		);
	};

	render(): React.ReactNode {
		const props = this.props;
		const className = [b(), props.className].filter(Boolean).join(' ');
		const renderFn = props.children;
		const children = props.data?.items || [];
		return (
			<div className={className} ref={this._ref}>
				<div className={b('list')}>{renderFn && children.map(renderFn)}</div>
				{props.emptyMessage && children.length === 0 ? (
					<div className={b('empty')}>{props.emptyMessage}</div>
				) : null}
				{this._renderPagination()}
			</div>
		);
	}
}

const ItemsList = withRouter(View);

export default ItemsList;
