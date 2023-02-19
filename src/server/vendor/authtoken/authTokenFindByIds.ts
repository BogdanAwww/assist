import {AuthTokenModel} from '@/server/schema/entities/AuthTokenTC';
import {checkIsLogged} from '@/server/vendor/user/checkIsLogged';

interface FilterOptions {
	ids: ReadonlyArray<string>;
}

export async function authTokenFindByIds({ids}: FilterOptions, context: any) {
	await checkIsLogged(context);
	return AuthTokenModel.find({_id: {$in: ids}});
}
