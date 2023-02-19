import {CountryModel, CountryTC} from '../../entities/CountryTC';

export default {
	type: [CountryTC],
	args: {},
	resolve: async (_, _args, _ctx) => {
		return CountryModel.find();
	}
};
