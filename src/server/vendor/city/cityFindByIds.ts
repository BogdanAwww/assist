import {CityModel} from '@/server/schema/entities/CityTC';

interface FilterOptions {
	ids: ReadonlyArray<string>;
}

export async function cityFindByIds({ids}: FilterOptions) {
	return CityModel.find({_id: {$in: ids}});
}
