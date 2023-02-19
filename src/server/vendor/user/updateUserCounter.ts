import {Document} from 'mongoose';
import {PortfolioProjectModel} from '@/server/schema/entities/PortfolioProjectTC';

export function updateUserCounter(user: Document, name: string, count: number): void {
	user.set(`_info.counter.${name}`, count);
}

export async function updateUserPortfolioCounter(user: Document) {
	const count = await PortfolioProjectModel.find({author: user._id}).countDocuments();
	updateUserCounter(user, 'portfolio', count);
	user.set('_info.hasPortfolio', count > 0);
	return user.save();
}
