import './labeled-field.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import Input, {InputProps} from '../input/input';
import Textarea, {TextareaProps} from '../textarea/textarea';
import Select, {SelectProps} from '../select/select';

interface BaseProps {
	label: React.ReactNode;
	labelWidth: number;
}

interface InputTypeProps extends BaseProps, InputProps {}

interface TextareaTypeProps extends BaseProps, TextareaProps {
	textarea: true;
}

interface SelectTypeProps extends BaseProps, SelectProps {
	select: true;
	value: any;
}

type Props = InputTypeProps | TextareaTypeProps | SelectTypeProps;

const b = classname('labeled-field');

class LabeledField extends React.Component<Props> {
	render(): React.ReactNode {
		const props = this.props;
		const baseProps = {
			error: undefined,
			invalid: Boolean(props.error),
			noMargin: true
		};
		return (
			<div
				className={b({
					size: ('size' in props && props.size) || 'medium'
				})}
			>
				<div className={b('wrap')}>
					<div className={b('label')} style={{width: props.labelWidth}}>
						{props.label}
					</div>
					<div className={b('input')}>
						{'textarea' in props ? (
							<Textarea {...props} {...baseProps} />
						) : 'select' in props ? (
							<Select {...props} {...baseProps} />
						) : (
							<Input {...props} {...baseProps} />
						)}
					</div>
				</div>
				{props.error ? (
					<div className={b('error')} style={{marginLeft: props.labelWidth}}>
						{props.error}
					</div>
				) : null}
			</div>
		);
	}
}

export default LabeledField;
