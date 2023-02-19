import './upload-list.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import Card from '../card/card';
import SvgIcon from '../svg-icon/svg-icon';
import {AnyUpload} from '@/common/types/upload';

import closeIcon from '@/common/icons/close.svg';

interface Props {
	uploads: AnyUpload[];
	onRemove?: (uploads: AnyUpload[]) => void;
}

const b = classname('upload-list');

class UploadList extends React.PureComponent<Props> {
	private _onRemove = (upload: AnyUpload): void => {
		const props = this.props;
		const uploads = props.uploads.filter((item) => item._id !== upload._id);
		props.onRemove?.(uploads);
	};

	private _renderUpload = (upload: AnyUpload): React.ReactNode => {
		const props = this.props;
		return (
			<div className={b('file')} key={upload._id}>
				<div>{upload.type === 'document' ? upload.filename : ''}</div>
				{props.onRemove ? (
					<div className={b('file-remove')} onClick={() => this._onRemove(upload)}>
						<SvgIcon url={closeIcon} width={16} height={16} />
					</div>
				) : null}
			</div>
		);
	};

	render(): React.ReactNode {
		const props = this.props;
		const uploads = props.uploads;
		if (uploads.length === 0) {
			return props.children;
		}
		return (
			<Card className={b()} view="light" rounded="small">
				{uploads.map(this._renderUpload)}
			</Card>
		);
	}
}

export default UploadList;
