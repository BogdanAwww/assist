import {CountryModel} from '@/server/schema/entities/CountryTC';

interface FilterOptions {
	ids: ReadonlyArray<string>;
}

export async function countryFindByIds({ids}: FilterOptions) {
	return CountryModel.find({_id: {$in: ids}});
}
