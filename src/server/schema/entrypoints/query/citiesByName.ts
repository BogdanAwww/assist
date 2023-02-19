import {CityModel, CityTC} from '../../entities/CityTC';
import {Context} from '@/server/modules/context';

export default {
	type: [CityTC],
	args: {
		name: 'String'
	},
	resolve: async (_, {name}, ctx: Context) => {
		const field = ctx.lang === 'en' ? 'name' : 'names.ru';
		return CityModel.find({
			[field]: {$regex: new RegExp('^' + name, 'i')}
		}).limit(10);
	}
};
