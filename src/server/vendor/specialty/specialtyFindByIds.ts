import {SpecialtyModel} from '@/server/schema/entities/SpecialtyTC';

interface FilterOptions {
	ids: ReadonlyArray<string>;
}

export async function specialtyFindByIds({ids}: FilterOptions) {
	return SpecialtyModel.find({_id: {$in: ids}});
}
