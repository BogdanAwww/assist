import * as React from 'react';
import contextConnect from '@/common/utils/context-connect';
import webStore from '@/web/state/store';
import adminStore from '@/admin/state/store';
import appActions from '@/web/actions/app-actions';
import type {Translates} from '@/web/translates/ru.ts';
import {sendMetrics} from '@/web/actions/data-provider';

const store = ENTRY === 'admin' ? adminStore : webStore;

interface I18nProps {
	translates: Translates;
	lang: string;
	setLanguage: (language: string) => void;
}

const {
	connect: i18nConnect,
	Context: TranslatesContext,
	Provider
} = contextConnect<I18nProps>('i18n', {
	translates: {} as Translates,
	lang: '',
	setLanguage: (language) => {
		console.log(language);
	}
});

const LANGUAGES = ['ru', 'en'] as const;

type Lang = typeof LANGUAGES[number];

interface TranslationModule {
	translates: Record<string, any>;
}

interface State {
	translates: Translates;
	lang: Lang;
	setLanguage: (lang: string) => void;
}

const TRANSLATIONS: Record<string, any> = {};

class TranslatesProvider extends React.PureComponent<{}, State> {
	constructor(props) {
		super(props);

		this.state = {
			translates,
			lang: getLang(),
			setLanguage: this._setLanguage
		};
	}

	componentDidMount() {
		const lang = getLang();
		this._loadTranslations(lang);
	}

	private _setLanguage = (lang: Lang): void => {
		setLang(lang);
		sendMetrics({type: 'set-language', data: lang}).then(() => {
			window.location.reload();
		});
	};

	private _loadTranslations = (lang: Lang): void => {
		import(`@/web/translates/${lang}`).then((module: TranslationModule) => {
			for (const key in module.translates) {
				TRANSLATIONS[key] = module.translates[key];
			}
			store.dispatch(appActions.setI18nReady());
		});
	};

	render(): React.ReactNode {
		return <Provider value={this.state}>{this.props.children}</Provider>;
	}
}

const translates = new Proxy(TRANSLATIONS, {
	get: (target, key: string) => {
		const value = target[key];
		return value || '%%INVALID_TRANSLATION%%';
	}
}) as Translates;

function setLang(lang: Lang): void {
	localStorage.setItem('lang', lang);
}

const SYSTEM_LANGS_MAP = {
	ru: ['ru', 'kz', 'ua', 'by']
};

function getLang(): Lang {
	const savedLanguage = localStorage.getItem('lang');
	const systemLang = navigator.language.substr(0, 2).toLowerCase();
	const language =
		savedLanguage ||
		Object.entries(SYSTEM_LANGS_MAP).reduce((parsedLang, [lang, langs]) => {
			if (parsedLang) {
				return parsedLang;
			}
			return langs.includes(systemLang) ? lang : undefined;
		}, '') ||
		'en';
	if (LANGUAGES.includes(language as Lang)) {
		return language as Lang;
	}
	setLang('ru');
	return 'ru';
}

export default TranslatesProvider;
export {I18nProps, TranslatesContext, i18nConnect, translates, getLang};
