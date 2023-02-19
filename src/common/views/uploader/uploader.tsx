import * as React from 'react';
import * as ReactRedux from 'react-redux';
import {Upload, UploadType} from '@/common/types/upload';
import upload from '@/web/utils/upload/upload';
import FilePicker, {FilePickerProps, FilePickerChildrenProps} from '../file-picker/file-picker';
import notificationActions from '@/web/actions/notification-actions';

const mapDispatchToProps = {
	showNotification: notificationActions.showNotification
};

interface ChildrenProps<T extends UploadType> extends FilePickerChildrenProps {
	upload?: Upload<T>;
	uploading?: boolean;
}

interface SelfProps<T extends UploadType> extends Omit<FilePickerProps, 'onChange'> {
	type?: T;
	onChange: (upload?: Upload<T>, dummyId?: string) => void;
	onUploadStart?: (upload: Upload<T>) => void;
	children: (props: ChildrenProps<T>) => React.ReactNode;
}

type Props<T extends UploadType> = SelfProps<T> & typeof mapDispatchToProps;

interface State<T extends UploadType> {
	upload?: Upload<T>;
	uploading?: boolean;
}

const connect = ReactRedux.connect(null, mapDispatchToProps);

class View<T extends UploadType = 'document'> extends React.PureComponent<Props<T>, State<T>> {
	constructor(props: Props<T>) {
		super(props);

		this.state = {};
	}

	private _onChange = (file: File): void => {
		const props = this.props;
		this.setState({uploading: true});
		const type = props.type || 'document';
		const dummyId = '' + new Date().getTime() + Math.floor(Math.random() * 1000000);
		if (props.onUploadStart) {
			if (type === 'document') {
				props.onUploadStart({
					_id: dummyId,
					type: 'document',
					format: '',
					url: '',
					filename: file.name,
					isImage: false
				} as Upload<T>);
			} else {
				props.onUploadStart({
					_id: dummyId,
					type: 'image',
					format: '',
					urlTemplate: ''
				} as Upload<T>);
			}
		}
		upload(type, file)
			.then((upload) => {
				this.setState({upload: upload as Upload<T>});
				props.onChange(upload as Upload<T>, dummyId);
			})
			.finally(() => {
				this.setState({uploading: false});
			});
	};

	render(): React.ReactNode {
		const props = this.props;
		const state = this.state;
		return (
			<FilePicker
				{...props}
				data={{upload: state.upload, uploading: state.uploading}}
				onChange={this._onChange}
			/>
		);
	}
}

const Uploader = connect(View);

export default Uploader;
