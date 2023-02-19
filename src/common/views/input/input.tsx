import './input.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import {formContext} from '@/common/views/form/form';
import ErrorLabel from '../error-label/error-label';

interface Props {
	name?: string;
	size?: 'small' | 'medium' | 'large';
	type?: 'text' | 'email' | 'password' | 'number';
	value?: string | number;
	placeholder?: string;
	autocomplete?: string;
	maxLength?: number;
	min?: number;

	disabled?: boolean;
	invalid?: boolean;
	error?: string | boolean;
	noMargin?: boolean;
	rounded?: boolean;

	additional?: React.ReactNode;

	onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
	onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const b = classname('input');

class Input extends React.Component<Props> {
	render(): React.ReactNode {
		const props = this.props;
		return (
			<formContext.Consumer>
				{(disabled) => (
					<div
						className={b('wrap', {
							size: props.size || 'medium',
							rounded: props.rounded,
							'no-margin': props.noMargin
						})}
					>
						{props.autocomplete === 'off' ? (
							<input type="hidden" autoComplete="off" autoCorrect="off" autoCapitalize="off" />
						) : null}
						<input
							className={b({
								invalid: props.invalid || Boolean(props.error)
							})}
							type={props.type}
							name={props.name}
							value={props.value}
							placeholder={props.placeholder}
							disabled={disabled || props.disabled}
							onChange={props.onChange}
							onFocus={props.onFocus}
							onBlur={props.onBlur}
							autoComplete={props.autocomplete}
							autoCorrect={props.autocomplete}
							autoCapitalize={props.autocomplete}
							maxLength={props.maxLength}
							min={props.min}
						/>
						{props.additional}
						<ErrorLabel>{props.error}</ErrorLabel>
					</div>
				)}
			</formContext.Consumer>
		);
	}
}

export default Input;
export {Props as InputProps};
