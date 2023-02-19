import * as React from 'react';
import FilePicker, {FilePickerChildrenProps, FilePickerProps} from '@/common/views/file-picker/file-picker';

interface ChildrenProps extends FilePickerChildrenProps {
	isDragover: boolean;
}

interface Props extends FilePickerProps {
	children: (props: ChildrenProps) => React.ReactNode;
}

interface State {
	isDragover: boolean;
}

class DragAndDropFile extends React.PureComponent<Props, State> {
	private _ref = React.createRef<HTMLDivElement>();

	constructor(props: Props) {
		super(props);

		this.state = {
			isDragover: false
		};
	}

	private _prevent = (e: React.DragEvent): void => {
		e.preventDefault();
		e.stopPropagation();
	};

	private _dragIn = (e: React.DragEvent): void => {
		this._prevent(e);
		this.setState({isDragover: true});
	};

	private _dragOut = (e: React.DragEvent): void => {
		this._prevent(e);
		this.setState({isDragover: false});
	};

	private _onDrop = (e: React.DragEvent): void => {
		const file = e.dataTransfer.files[0];
		this.props.onChange?.(file);
		this._dragOut(e);
	};

	render(): React.ReactNode {
		const props = this.props;
		return (
			<div
				ref={this._ref}
				onDragStart={this._prevent}
				onDrag={this._prevent}
				onDragOver={this._dragIn}
				onDragEnter={this._dragIn}
				onDragLeave={this._dragOut}
				onDragEnd={this._dragOut}
				onDrop={this._onDrop}
			>
				<FilePicker {...props}>
					{({onClick, reset}) =>
						props.children({
							onClick,
							isDragover: this.state.isDragover,
							reset
						})
					}
				</FilePicker>
			</div>
		);
	}
}

export default DragAndDropFile;
