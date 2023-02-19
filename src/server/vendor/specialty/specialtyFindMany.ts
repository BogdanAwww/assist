import {SpecialtyModel} from '@/server/schema/entities/SpecialtyTC';
import {Schema} from 'mongoose';

interface FilterOptions {
	group?: Schema.Types.ObjectId;
}

export async function specialtyFindMany(query: FilterOptions) {
	return SpecialtyModel.find(query);
}
