import {ProjectModel} from '@/server/schema/entities/ProjectTC';

interface FilterOptions {
	ids: ReadonlyArray<string>;
}

export async function projectFindByIds({ids}: FilterOptions) {
	return ProjectModel.find({_id: {$in: ids}});
}
