import {SystemModel} from '../../entities/SystemTC';

export default {
	type: 'JSON',
	args: {},
	resolve: async (_, _args) => {
		const system = await SystemModel.findOne({});
		return system.get('rate');
	}
};
