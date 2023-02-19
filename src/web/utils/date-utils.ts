import {getPluralNoun} from './plural-utils';
import {getLang} from '@/common/views/translates-provider/translates-provider';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const DATE_PLURAL_RU: Record<string, string[]> = {
	day: ['%d день', '%d дня', '%d дней'],
	hour: ['%d час', '%d часа', '%d часов'],
	minute: ['%d минута', '%d минуты', '%d минут']
};

const DATE_PLURAL_EN: Record<string, string[]> = {
	day: ['%d day', '%d days'],
	hour: ['%d hour', '%d hours'],
	minute: ['%d minute', '%d minutes']
};

function getEstimate(est?: number): string {
	let type: string = '';
	let value = est;
	if (!value) {
		return '';
	}
	if (value > DAY) {
		type = 'day';
		value = (value / DAY) | 0;
	} else if (value > HOUR) {
		type = 'hour';
		value = (value / HOUR) | 0;
	} else {
		type = 'minute';
		value = (value / MINUTE) | 0;
	}
	return getPluralNoun(value, ...(getLang() === 'ru' ? DATE_PLURAL_RU : DATE_PLURAL_EN)[type]);
}

export {getEstimate, DAY};
