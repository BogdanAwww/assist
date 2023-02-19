import {SpecialtyModel, SpecialtyTC} from '../../entities/SpecialtyTC';

export default {
	type: SpecialtyTC,
	args: {id: 'String'},
	resolve: async (_, {id}, _ctx) => {
		return SpecialtyModel.findOne({_id: id});
	}
};
