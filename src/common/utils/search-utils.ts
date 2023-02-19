import {History} from 'history';
import qs from 'qs';

function updateSearch(params: any, history: History): void {
	const query = qs.stringify(params);
	const currentQuery = (history.location.search || '').slice(1);
	if (query || query !== currentQuery) {
		history.replace(history.location.pathname + (query ? '?' + query : ''));
	}
}

interface ParseOptions {
	numbers?: boolean;
}

function parseSearch(options: ParseOptions = {}): any {
	return qs.parse(window.location.search || '', {
		decoder: (value, def) => decoder(value, def, options),
		ignoreQueryPrefix: true
	});
}

const KEYWORDS = {
	true: true,
	false: false,
	null: null,
	undefined: undefined
};

function decoder(value: string, defaultDecoder: any, options: ParseOptions): any {
	if (options.numbers) {
		const num = parseInt(value);
		if (value && typeof num === 'number' && isFinite(num) && num.toString() === value) {
			return num;
		}
	}
	if (value in KEYWORDS) {
		return KEYWORDS[value];
	}
	return defaultDecoder(value);
}

export {updateSearch, parseSearch};
