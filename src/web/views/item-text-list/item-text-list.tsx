import './item-text-list.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import SvgIcon from '@/common/views/svg-icon/svg-icon';

import closeIcon from '@/common/icons/close.svg';

interface Props<T> {
	items: T[];
	getTitle: (item: T) => string;
	getValue?: (item: T) => string;
	onRemove?: (items: T[]) => void;
}

const b = classname('item-text-list');

class ItemTextList<T = any> extends React.PureComponent<Props<T>> {
	private _renderItem = (item: T, index: number) => {
		const props = this.props;
		const title = props.getTitle(item);
		const key = props.getValue?.(item) || index;
		return (
			<div className={b('item')} key={key}>
				<div>{title}</div>
				{props.onRemove ? (
					<div
						className={b('remove')}
						onClick={() => props.onRemove!(props.items.filter((lookupItem) => lookupItem !== item))}
					>
						<SvgIcon url={closeIcon} width={16} height={16} />
					</div>
				) : null}
			</div>
		);
	};

	render(): React.ReactNode {
		const props = this.props;
		return <div className={b()}>{props.items.map(this._renderItem)}</div>;
	}
}

export default ItemTextList;
