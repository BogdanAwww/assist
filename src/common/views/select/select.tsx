import './select.css';

import classname from '@/common/core/classname';
import * as React from 'react';
import {debounce} from 'lodash-es';
import ReactSelect, {NamedProps, StylesConfig, components, OptionsType, Props as SelectProps} from 'react-select';
import asyncAction, {AsyncAction} from '@/common/core/async-action/async-action';
import {translates} from '../translates-provider/translates-provider';

const DEFAULT_STYLES: StylesConfig<SelectOptionType, false> = {
	control: (provided, state) => {
		const borderColor = state.selectProps.error ? '#f00' : state.isFocused ? '#9A9A9A' : '#D6D6D6';
		return {
			...provided,
			minHeight: 44,
			outline: 'none',
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
	})
};

type SelectOptionType = {label: string; value: string; shortLabel?: string};
type SelectOptionsType = OptionsType<SelectOptionType>;

interface Props<IsMulti extends boolean = false> extends Omit<SelectProps<SelectOptionType, IsMulti>, 'value'> {
	value?: string;
	error?: string | boolean;
	onInputChange?: (value: any) => Promise<SelectOptionsType>;
}

interface State {
	isLoading?: boolean;
	options?: SelectOptionsType;
}

const Input = (props) => <components.Input {...props} maxLength={50} />;

const b = classname('select');

class Select<IsMulti extends boolean = false> extends React.Component<Props<IsMulti>, State> {
	private _loadAction?: AsyncAction;
	private _debouncedOnInputChange?: (value: any) => void;

	constructor(props: Props<IsMulti>) {
		super(props);

		this.state = {};
		this._debouncedOnInputChange = debounce(this._onInputChange, 300);
	}

	private _onInputChange = (value: any): void => {
		const props = this.props;
		if (!props.onInputChange || !this._debouncedOnInputChange || !value) {
			return;
		}

		asyncAction.cancel(this._loadAction);

		this.setState({isLoading: true});
		this._loadAction = asyncAction.create(props.onInputChange(value), {
			success: (options) => this.setState({options}),
			always: () => this.setState({isLoading: false})
		});
	};

	componentWillUnmount() {
		asyncAction.cancel(this._loadAction);
		this._debouncedOnInputChange = undefined;
	}

	render(): React.ReactNode {
		const props = this.props;
		const state = this.state;
		const additionalProps: NamedProps<SelectOptionType, IsMulti> = props.onInputChange
			? {
					components: {
						Input,
						IndicatorSeparator: () => null,
						DropdownIndicator: () => null,
						SingleValue: (props) => (
							<components.SingleValue {...props}>
								{props.data.shortLabel || props.data.label}
							</components.SingleValue>
						)
					},
					openMenuOnClick: false,
					openMenuOnFocus: false,
					filterOption: () => true
			  }
			: {
					components: {Input}
			  };

		const options = state.options || props.options || [];
		const selectedValue = options.filter(
			(lookupValue) => (props.getOptionValue?.(lookupValue) || lookupValue.value) === props.value
		);
		return (
			<>
				<ReactSelect<SelectOptionType, IsMulti>
					{...(props as any)}
					value={selectedValue}
					styles={DEFAULT_STYLES}
					noOptionsMessage={props.noOptionsMessage || (() => translates.empty)}
					onInputChange={this._debouncedOnInputChange}
					options={options}
					isLoading={state.isLoading || props.isLoading}
					{...additionalProps}
				/>
				{props.error ? <div className={b('error')}>{props.error}</div> : null}
			</>
		);
	}
}

export default Select;
export {Props as SelectProps, SelectOptionsType};
