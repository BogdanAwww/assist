import 'react-datepicker/dist/react-datepicker.min.css';

import * as React from 'react';
import ReactDatepicker, {setDefaultLocale, registerLocale} from 'react-datepicker';
import ru from 'date-fns/locale/ru';
import classname from '@/common/core/classname';

registerLocale('ru', ru);
setDefaultLocale('ru');

const DAY = 24 * 60 * 60 * 1000;

interface Props {
	name: string;
	value: number | undefined;
	disabled?: boolean;

	setFieldValue: (name: string, value: number) => void;
}

const b = classname('input');

class DatePicker extends React.PureComponent<Props> {
	private _onChange = (date: Date): void => {
		const props = this.props;
		const value = Math.floor(Number(date) / DAY) * DAY;
		props.setFieldValue(props.name, value);
	};

	render(): React.ReactNode {
		const props = this.props;
		const selected = props.value ? new Date(props.value) : undefined;
		return (
			<ReactDatepicker
				className={b({disabled: props.disabled})}
				disabled={props.disabled}
				selected={selected}
				value={selected?.toLocaleDateString()}
				dateFormat="dd.MM.yyyy"
				onChange={this._onChange}
				disabledKeyboardNavigation
			/>
		);
	}
}

export default DatePicker;
