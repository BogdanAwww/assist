import path from 'path';
import {Context} from '@/server/modules/context';
import doSpaces from '@/server/modules/do-spaces';
import {migrateUsersFromXLSX} from '@/server/modules/migrate/users';
import {UploadModel} from '@/server/schema/entities/UploadTC';

export default {
	type: 'JSON',
	args: {id: 'String'},
	resolve: async (_, {id}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user && user.get('_role')) {
			const upload = await UploadModel.findOne({_id: id});
			const key = upload?.get('key');
			if (!key || path.extname(key) !== '.xlsx') {
				throw new Error('invalid file');
			}
			const buffer = await doSpaces.download(key);
			return migrateUsersFromXLSX(buffer);
		}

		return;
	}
};
