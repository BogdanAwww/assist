import {Context} from '@/server/modules/context';
import {ProjectModel, ProjectTC} from '../../entities/ProjectTC';
import {CreateProjectInput} from '../../types/inputs/project';
import {handleTranslation} from '@/server/modules/translates';

export default {
	type: ProjectTC,
	args: {
		id: 'String!',
		input: CreateProjectInput.NonNull
	},
	resolve: async (_, {id, input}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			const project = await ProjectModel.findOne({
				_id: id,
				author: user.get('_id'),
				status: {$in: ['draft', 'active']}
			});
			if (project) {
				input.paycheck.currency = project.get('paycheck.currency');
				await handleTranslation(input, 'title', 'title_en');
				await handleTranslation(input, 'description', 'description_en');
				project.set(input);
				return await project.save();
			}
		}

		return;
	}
};
