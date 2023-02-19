import './text-switch.css';

import * as React from 'react';
import classname from '@/common/core/classname';

const b = classname('text-switch');

interface SwitchItem {
	key: string;
	title: string;
}

interface Props {
	items: SwitchItem[];
	selected: string;
	onChange?: (key: string) => void;
}

function TextSwitch({items, selected, onChange}: Props) {
	function _onChange(key: string) {
		if (key !== selected) {
			onChange?.(key);
		}
	}

	return (
		<div className={b()}>
			{items.map(({key, title}) => (
				<div className={b('item', {active: key === selected})} onClick={() => _onChange(key)} key={key}>
					{title}
				</div>
			))}
		</div>
	);
}

export default TextSwitch;
export {SwitchItem};
