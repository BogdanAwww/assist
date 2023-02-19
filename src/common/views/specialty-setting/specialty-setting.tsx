import './specialty-setting.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import {getLang} from '../translates-provider/translates-provider';

import closeIcon from '@/common/icons/close.svg';

interface Props {
	id?: string;
	title?: string;
	index: number;
	onAddClick: () => void;
	onRemoveClick: (id: string) => void;
}

const b = classname('specialty-setting');

class SpecialtySetting extends React.Component<Props> {
	private _addSpecialty = (): void => {
		const props = this.props;
		if (!props.id) {
			props.onAddClick();
		}
	};

	private _removeSpecialty = (e: React.MouseEvent): void => {
		const props = this.props;
		if (props.id) {
			e.stopPropagation();
			props.onRemoveClick(props.id);
		}
	};

	render(): React.ReactNode {
		const props = this.props;
		return (
			<div className={b({selected: Boolean(props.id)})} onClick={this._addSpecialty}>
				<div className={b('icon')} onClick={this._removeSpecialty}>
					<SvgIcon url={closeIcon} width={20} height={20} />
				</div>
				<div className={b('text')}>
					{props.title ? (
						props.title
					) : (
						<div>
							{getLang() === 'ru' ? 'Специальность' : 'Specialty'} <b>{props.index + 1}</b>
						</div>
					)}
				</div>
			</div>
		);
	}
}

export default SpecialtySetting;
