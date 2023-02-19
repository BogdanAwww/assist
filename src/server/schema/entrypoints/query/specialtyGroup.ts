import {SpecialtyGroupModel, SpecialtyGroupTC} from '../../entities/SpecialtyGroupTC';

export default {
	type: SpecialtyGroupTC,
	args: {id: 'String'},
	resolve: async (_, {id}, _ctx) => {
		return SpecialtyGroupModel.findOne({_id: id});
	}
};
