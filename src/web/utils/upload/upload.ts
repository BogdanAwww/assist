import store from '@/web/state/store';
import {Upload, UploadType} from '@/common/types/upload';
import {uploadFile} from '@/web/actions/data-provider';
import notificationActions from '@/web/actions/notification-actions';
import {hasErrorCode} from '@/common/core/apollo-client/errors';

async function upload<T extends UploadType>(type: T, file: File): Promise<Upload<T> | undefined> {
	return uploadFile({type, file}).catch((e) => {
		const text = hasErrorCode(e, 'UNSUPPORTED')
			? 'Неправильный формат файла, попробуйте загрузить другой файл.'
			: 'Произошла ошибка при загрузке файла.';
		store.dispatch(
			notificationActions.showNotification({
				view: 'error',
				text,
				timeout: true
			})
		);
		return undefined;
	});
}

export default upload;
