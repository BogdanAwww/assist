import store from '../state/store';

const CURRENCIES = {
	RUB: '₽',
	USD: '$'
} as const;

type CurrencyType = keyof typeof CURRENCIES;

function getCurrency(type: CurrencyType): string {
	return CURRENCIES[type];
}

function getLocaleCurrency(lang: string): string {
	return CURRENCIES[CURRENCY_BY_LANG[lang]];
}

const CURRENCY_BY_LANG = {
	ru: 'RUB',
	en: 'USD'
};

type Formatter = (amount: number) => string;

const formatters: Record<CurrencyType, Formatter> = {
	RUB: (amount) => `${formatPrice(amount, 'ru')} ${CURRENCIES.RUB}`,
	USD: (amount) => `${formatPrice(amount, 'en')}${CURRENCIES.USD}`
};

function formatPrice(amount: number, lang: string): string {
	const num = amount !== Math.floor(amount) ? parseFloat(amount.toFixed(2)) : amount;
	return num.toLocaleString(lang);
}

function getConvertedLocalePrice(amount: number, currency: CurrencyType, lang: string): string {
	const langCurrency = (CURRENCY_BY_LANG[lang] || 'RUB') as CurrencyType;
	if (currency === langCurrency) {
		return formatters[currency](amount);
	}

	const rates = store.getState().currencyRates;
	if (currency === 'RUB' && rates?.usdrub && langCurrency === 'USD') {
		return formatters.USD(amount / rates.usdrub);
	}

	if (currency === 'USD' && rates?.usdrub && langCurrency === 'RUB') {
		return formatters.RUB(amount * rates.usdrub);
	}

	return '';
}

function getLocalePrice(amount: number, currency: CurrencyType) {
	return formatters[currency](amount);
}

export {CurrencyType, getCurrency, getLocaleCurrency, getConvertedLocalePrice, getLocalePrice};
