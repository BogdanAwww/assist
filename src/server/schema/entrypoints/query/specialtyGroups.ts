import {SpecialtyGroupModel, SpecialtyGroupTC} from '../../entities/SpecialtyGroupTC';

export default {
	type: [SpecialtyGroupTC],
	args: {},
	resolve: () => SpecialtyGroupModel.find()
};
