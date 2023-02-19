import {toPairs} from 'lodash';
import {ProjectTypeTC, PROJECT_TYPES} from '../../entities/ProjectTypeTC';
import {Context} from '@/server/modules/context';

const data = {
	ru: toPairs(PROJECT_TYPES).map(([id, titles]) => ({id, title: titles.ru})),
	en: toPairs(PROJECT_TYPES).map(([id, titles]) => ({id, title: titles.en}))
};

export default {
	type: [ProjectTypeTC],
	args: {},
	resolve: (_, _args, ctx: Context) => data[ctx.lang]
};
