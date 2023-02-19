import './pagination.css';

import * as React from 'react';
import classname from '@/common/core/classname';

interface Props {
	value?: number;
	max?: number;
	onChange: (value: number) => void;
}

const CENTER_LIMIT = 3;

const b = classname('pagination');

class Pagination extends React.PureComponent<Props> {
	private _getItems = (value: number, max: number): number[] => {
		const items = new Array(max).fill(undefined);
		items[0] = 1;
		items[max - 1] = max;
		return items
			.map((item, index) => {
				if (index >= value - CENTER_LIMIT && index <= value + CENTER_LIMIT) {
					return index + 1;
				}
				return item;
			})
			.filter((value): value is number => Boolean(value));
	};

	private _renderBlock = (index: number | string, active?: boolean): React.ReactNode => {
		const props = this.props;
		const value = props.value || 0;
		return (
			<div
				className={b('block', {active, current: value === index})}
				onClick={active && typeof index === 'number' ? () => props.onChange(index) : undefined}
			>
				{index}
			</div>
		);
	};

	private _renderItem = (value: number, index: number, arr: number[]): React.ReactNode => {
		const nextValue = arr[index + 1];
		const spaceElement = nextValue - value > 1 ? this._renderBlock('...') : null;
		return (
			<React.Fragment key={index}>
				{this._renderBlock(value, true)}
				{spaceElement}
			</React.Fragment>
		);
	};

	render(): React.ReactNode {
		const props = this.props;
		if (!props.value || !props.max || props.max === 1) {
			return null;
		}
		const items = this._getItems(props.value, props.max);
		return <div className={b()}>{items.map(this._renderItem)}</div>;
	}
}

export default Pagination;
