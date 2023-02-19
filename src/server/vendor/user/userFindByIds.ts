import {Context} from '@/server/modules/context';
import {userHideFields, UserModel} from '@/server/schema/entities/UserTC';
import {WebsocketContext} from '@/server/modules/pubsub';

interface FilterOptions {
	ids: ReadonlyArray<string>;
}

export async function userFindByIds({ids}: FilterOptions, ctx: Context | WebsocketContext) {
	return UserModel.find({_id: {$in: ids}}).then((users) => users?.map((user) => userHideFields(user, ctx)));
}
