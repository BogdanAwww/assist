import {PortfolioProjectModel} from '@/server/schema/entities/PortfolioProjectTC';
import {Schema} from 'mongoose';

interface FilterOptions {
	_id?: Schema.Types.ObjectId;
}

export async function portfolioProjectFindOne(filter: FilterOptions) {
	return PortfolioProjectModel.findOne(filter);
}
