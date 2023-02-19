import {v2} from '@google-cloud/translate';
import config from '@/server/config/translate-credentials';
import cyrillicToTranslit from 'cyrillic-to-translit-js';

const translate = new v2.Translate({
	credentials: config,
	projectId: config.project_id
});

const transliter = new cyrillicToTranslit();

const getTranslation = async (text: string, lang: string, translit?: boolean) => {
	if (translit && lang === 'en') {
		return transliter.transform(text);
	}
	const result = await translate.translate(text, lang).catch(() => undefined);
	return result && result[0];
};

async function handleTranslation(input: object, field: string, fieldEn: string): Promise<void> {
	const fieldValue = input[field];
	if (fieldValue && fieldValue.match(/[а-яА-ЯёЁйЙ]*/g)) {
		input[fieldEn] = await getTranslation(fieldValue, 'en');
	} else {
		input[fieldEn] = fieldValue;
	}
}

export {getTranslation, handleTranslation};
