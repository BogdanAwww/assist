import {CityModel, CityTC} from '../../entities/CityTC';

export default {
	type: [CityTC],
	args: {
		countryId: 'String'
	},
	resolve: async (_, {countryId}, _ctx) => {
		return CityModel.find({country: countryId});
	}
};
