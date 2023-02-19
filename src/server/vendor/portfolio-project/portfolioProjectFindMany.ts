import {PortfolioProjectModel} from '@/server/schema/entities/PortfolioProjectTC';
import {Schema} from 'mongoose';

interface FilterOptions {
	author: Schema.Types.ObjectId;
	specialty?: string;
}

export async function portfolioProjectFindMany(query: FilterOptions) {
	return PortfolioProjectModel.find(query);
}
