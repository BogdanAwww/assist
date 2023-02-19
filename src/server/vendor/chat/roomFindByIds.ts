import {Context} from '@/server/modules/context';
import {ChatRoomModel} from '@/server/schema/entities/ChatRoomTC';

interface FilterOptions {
	ids: ReadonlyArray<string>;
}

export async function roomFindById(id: any, optional: any = {}) {
	return ChatRoomModel.findOne({_id: id, ...optional});
}

export async function roomFindByIds({ids}: FilterOptions, _ctx: Context) {
	return ChatRoomModel.find({_id: {$in: ids}});
}
