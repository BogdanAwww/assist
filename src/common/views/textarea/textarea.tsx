import './textarea.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import {formContext} from '@/common/views/form/form';

interface Props {
	name?: string;
	size?: 'xs' | 'small' | 'medium' | 'large';
	value?: string;
	placeholder?: string;

	rows?: number;
	maxlength?: number;
	disabled?: boolean;
	invalid?: boolean;
	error?: string | boolean;
	noMargin?: boolean;

	onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
	onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
	onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;

	inputRef?: React.RefObject<HTMLTextAreaElement>;
}

const b = classname('textarea');

class Textarea extends React.Component<Props> {
	render(): React.ReactNode {
		const props = this.props;
		return (
			<formContext.Consumer>
				{(disabled) => (
					<div
						className={b('wrap', {
							size: props.size || 'medium',
							'no-margin': props.noMargin
						})}
					>
						<textarea
							className={b({
								invalid: props.invalid || Boolean(props.error)
							})}
							name={props.name}
							value={props.value}
							placeholder={props.placeholder}
							rows={props.rows}
							disabled={disabled || props.disabled}
							onChange={props.onChange}
							onKeyDown={props.onKeyDown}
							onBlur={props.onBlur}
							maxLength={props.maxlength}
							ref={props.inputRef}
						/>
						{props.error ? <div className={b('error')}>{props.error}</div> : null}
					</div>
				)}
			</formContext.Consumer>
		);
	}
}

export default Textarea;
export {Props as TextareaProps};
