import {Context} from '../modules/context';
import {upperFirst} from 'lodash';

function getLocaleString(values: Record<string, string>, lang: string): string {
	const ru = values.ru || '';
	const en = values.en || '';
	const isRu = ru.match(/[а-яА-ЯёЁйЙ]*/g);
	if (lang === 'en' && !isRu) {
		return upperFirst(ru);
	}
	return upperFirst(lang === 'ru' ? ru : en || ru);
}

function getLocaleResolver(ruField: string, enField: string) {
	return {
		type: 'String',
		resolve: (source, _args, ctx: Context) => {
			return getLocaleString({ru: source[ruField], en: source[enField]}, ctx.lang);
		},
		projection: {[ruField]: 1, [enField]: 1}
	};
}

export {getLocaleString, getLocaleResolver};
