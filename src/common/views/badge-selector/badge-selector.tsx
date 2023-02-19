import './badge-selector.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import Badge, {BadgeProps} from '../badge/badge';
import {translates} from '../translates-provider/translates-provider';

interface BaseProps<T, Value = string> {
	name: string;
	view?: BadgeProps['view'];
	size?: BadgeProps['size'];

	value: Value | undefined;
	getTitle?: (item: T) => string;
	getValue?: (item: T) => string;
	items: T[];
	onChange: (name: string, value: Value) => void;

	emptyMessage?: string;
	disabled?: boolean;

	additional?: React.ReactNode;
}

type Props<T> = BaseProps<T> | (BaseProps<T, string[]> & {multi: true; limit: number});

const b = classname('badge-selector');

const DEFAULT_LIMIT = 6;

class BadgeSelector<T = any> extends React.PureComponent<Props<T>> {
	private _onClick = (value: string): void => {
		const props = this.props;
		if (props.disabled) {
			return;
		}
		if ('multi' in props) {
			const values = props.value;
			const limit = props.limit || DEFAULT_LIMIT;
			if (values) {
				if (values.includes(value)) {
					props.onChange(
						props.name,
						values.filter((lookupItem) => lookupItem !== value)
					);
				} else {
					props.onChange(props.name, values.concat([value]).slice(0, limit));
				}
			}
		} else {
			props.onChange(props.name, value);
		}
	};

	private _renderItem = (content: React.ReactNode, index?: number): React.ReactNode => {
		return (
			<div className={b('item')} key={index}>
				{content}
			</div>
		);
	};

	private _renderBadge = (item: any, index: number): React.ReactNode => {
		const props = this.props;
		const value = props.getValue?.(item) || item.value;
		const title = props.getTitle?.(item) || item.title;
		return this._renderItem(
			<Badge
				view={props.view || 'gray'}
				size={props.size || 'small'}
				title={title}
				disabled={props.disabled}
				onClick={() => this._onClick(value)}
				selected={'multi' in props ? props.value?.includes(value) : value === props.value}
			/>,
			index
		);
	};

	private _renderEmpty = (): React.ReactNode => {
		return <div className={b('empty')}>{this.props.emptyMessage || translates.empty}</div>;
	};

	render(): React.ReactNode {
		const props = this.props;
		const items = props.items;
		return (
			<div className={b()}>
				{items.length > 0 ? (
					<>
						{items.map(this._renderBadge)}
						{props.additional ? this._renderItem(props.additional) : null}
					</>
				) : (
					this._renderEmpty()
				)}
			</div>
		);
	}
}

export default BadgeSelector;
