import './file-picker.css';

import * as React from 'react';
import classname from '@/common/core/classname';

interface ChildrenProps {
	file?: File;
	onClick: () => void;
	reset: () => void;
	[x: string]: any;
}

interface Props {
	accept?: 'image' | 'document';
	onChange?: (file?: File) => void;
	children: (props: ChildrenProps) => React.ReactNode;
	data?: Record<string, any>;
}

interface State {
	file?: File;
}

const b = classname('file-picker');

const ACCEPT_DOCUMENT = [
	'text/plain',
	'application/pdf',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
	'application/vnd.ms-powerpoint',
	'application/vnd.openxmlformats-officedocument.presentationml.presentation',
	'application/vnd.ms-excel',
	'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
	'application/vnd.rar',
	'application/zip',
	'image/png',
	'image/jpeg'
].join(',');
const ACCEPT_IMAGE = ['image/png', 'image/jpeg'].join(',');

class FilePicker extends React.Component<Props, State> {
	private _ref = React.createRef<HTMLInputElement>();

	constructor(props: Props) {
		super(props);

		this.state = {};
	}

	private _onClick = (): void => {
		const element = this._ref.current;
		if (element) {
			element.click();
		}
	};

	private _onChange = (): void => {
		const element = this._ref.current;
		const file = element?.files?.[0];
		if (!element || !file) {
			return;
		}
		this.setState({file});
		this.props.onChange?.(file);
		element.value = null as unknown as string;
	};

	private _reset = (): void => {
		this.setState({file: undefined});
		this.props.onChange?.(undefined);
	};

	render(): React.ReactNode {
		const props = this.props;
		const accept = props.accept === 'image' ? ACCEPT_IMAGE : ACCEPT_DOCUMENT;
		return (
			<>
				<input className={b()} type="file" ref={this._ref} accept={accept} onChange={this._onChange} />
				{props.children({
					file: this.state.file,
					onClick: this._onClick,
					reset: this._reset,
					...props.data
				})}
			</>
		);
	}
}

export default FilePicker;
export {Props as FilePickerProps, ChildrenProps as FilePickerChildrenProps};
