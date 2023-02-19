import {Context} from '@/server/modules/context';
import {processDocumentType, processImageType} from '@/server/modules/upload';
import {UploadTC} from '../../entities/UploadTC';
import {UploadInput} from '../../types/Scalars';

export default {
	type: UploadTC,
	args: {
		type: 'String',
		file: UploadInput
	},
	resolve: async (_, {type, file}: {type: string; file: any}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			const {createReadStream, filename} = file.file;
			const userId = user._id.toString();
			const stream = createReadStream();
			if (type === 'image') {
				return processImageType(userId, stream, filename);
			}
			if (type === 'document') {
				return processDocumentType(userId, stream, filename);
			}
			return;
		}

		return;
	}
};
