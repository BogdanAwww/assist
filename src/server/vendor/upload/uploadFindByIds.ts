import {UploadModel} from '@/server/schema/entities/UploadTC';

interface FilterOptions {
	ids: ReadonlyArray<string>;
}

export async function uploadFindByIds({ids}: FilterOptions) {
	return UploadModel.find({_id: {$in: ids}});
}
