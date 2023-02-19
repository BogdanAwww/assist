import './count-filters.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import ReactSelect, {StylesConfig, components} from 'react-select';
import {TranslatesContext} from '@/common/views/translates-provider/translates-provider';

const DEFAULT_STYLES: StylesConfig<any, false> = {
	control: (provided, state) => {
		const borderColor = state.selectProps.error ? '#f00' : state.isFocused ? '#9A9A9A' : '#D6D6D6';
		return {
			...provided,
			outline: 'none',
			border: 'none',
			borderColor,
			boxShadow: 'none',
			'&:hover': {
				borderColor
			}
		};
	},
	valueContainer: (provided) => ({
		...provided,
		padding: '10px 16px',
		fontSize: 12,
		lineHeight: '14px'
	}),
	singleValue: (provided) => ({
		...provided,
		right: 0
	})
};

interface CountItem<T = string> {
	title: string;
	value: T;
	count?: number;
	check?: (value?: T) => boolean;
}

interface Props<T> {
	items: CountItem<T>[];
	value?: T;
	defaultValue?: T;
	onChange?: (value: T) => void;
	compact?: boolean;
}

const b = classname('count-filters');

class CountFilters<T extends string = string> extends React.PureComponent<Props<T>> {
	static contextType = TranslatesContext;

	private _isActiveItem = (item: CountItem<T>): boolean => {
		const props = this.props;
		const value = props.value || props.defaultValue;
		return item.check?.(value) || value === item.value;
	};

	private _renderItem = (item: CountItem<T>): React.ReactNode => {
		const props = this.props;
		return (
			<div
				className={b('item', {
					active: this._isActiveItem(item),
					interactive: Boolean(props.onChange)
				})}
				onClick={() => props.onChange?.(item.value)}
				key={item.value}
			>
				<div className={b('title')}>{item.title}</div>
				{typeof item.count === 'number' ? <div className={b('count')}>{item.count}</div> : null}
			</div>
		);
	};

	private _renderSelect = (): React.ReactNode => {
		const props = this.props;
		const items = props.items;
		const selectedValue = items.find((item) => this._isActiveItem(item));
		return (
			<div className={b('select')}>
				<ReactSelect
					value={selectedValue}
					components={{
						IndicatorSeparator: () => null,
						SingleValue: (props) => (
							<components.SingleValue {...props}>
								<span className={b('option-title')}>{props.data.title}</span>
								<span className={b('option-count')}>{props.data.count || ''}</span>
							</components.SingleValue>
						),
						Option: (props) => (
							<components.Option {...props}>
								<div className={b('option')}>
									<div>{props.data.title}</div>
									<div>{props.data.count}</div>
								</div>
							</components.Option>
						)
					}}
					styles={DEFAULT_STYLES}
					getOptionLabel={(item) => item.title}
					options={items}
					isSearchable={false}
					onChange={(item) => item && props.onChange?.(item.value)}
				/>
			</div>
		);
	};

	render(): React.ReactNode {
		const props = this.props;
		if (props.compact) {
			return this._renderSelect();
		}
		const items = props.items;
		return <div className={b()}>{items.map(this._renderItem)}</div>;
	}
}

export default CountFilters;
export {CountItem};
