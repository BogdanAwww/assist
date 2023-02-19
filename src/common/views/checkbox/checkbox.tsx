import './checkbox.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import SvgIcon from '../svg-icon/svg-icon';

import tickBoldIcon from '@/common/icons/tick-bold.svg';

interface Props {
	name: string;
	value?: boolean;
	disabled?: boolean;

	setFieldValue: (name: string, value: boolean) => void;
}

const b = classname('checkbox');

class Checkbox extends React.PureComponent<Props> {
	private _onClick = (e): void => {
		e.stopPropagation();
		const props = this.props;
		if (!props.disabled) {
			props.setFieldValue(props.name, !props.value);
		}
	};

	render(): React.ReactNode {
		const props = this.props;
		return (
			<div
				className={b({
					selected: props.value,
					disabled: props.disabled
				})}
				onClick={this._onClick}
			>
				<div className={b('icon')}>
					{props.value ? (
						<div className={b('tick')}>
							<SvgIcon url={tickBoldIcon} width={18} height={16} noFill stroke />
						</div>
					) : null}
				</div>
				<div className={b('label')}>{props.children}</div>
			</div>
		);
	}
}

export default Checkbox;
