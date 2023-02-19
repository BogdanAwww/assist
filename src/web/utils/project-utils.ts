// http://img.youtube.com/vi/<YouTube_Video_ID_HERE>/maxresdefault.jpg
// http://vimeo.com/api/v2/video/6271487.json

// https://rutube.ru/video/9978791838e4cd24ee0b74c8a1773c50/
// <iframe width="720" height="405" src="https://rutube.ru/play/embed/13394008" frameBorder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>

// https://vk.com/video?z=video-154741459_456239170%2Fpl_cat_updates
// https://vk.com/video-154741459_456239170

// https://www.kinopoisk.ru/series/1363091/?from_block=trailer_promo
// https://www.kinopoisk.ru/film/326/
// https://hd.kinopoisk.ru/film/4da06acee046453097031068c8a6260a/?from_block=main_page&from_position=1

import request from '@/common/core/request/request';
import {PaycheckType, ProjectType, ProjectApplicationsFilter} from '@/common/types/project';
import {upperFirst} from 'lodash-es';
import {getPortfolioThumbnail} from '../actions/data-provider';
import {translates} from '@/common/views/translates-provider/translates-provider';

import googleDriveIcon from '@/common/icons/google-drive.svg';
import yandexDiskIcon from '@/common/icons/yandex-disk.svg';
import soundcloudIcon from '@/common/icons/soundcloud.svg';
import kinopoiskIcon from '@/common/icons/kinopoisk.svg';
import dropboxIcon from '@/common/icons/dropbox.svg';

const YOUTUBE_EMBED_URL = 'https://www.youtube.com/embed/%s';
const VIMEO_EMBED_URL = 'https://player.vimeo.com/video/%s';
const SOUNDLOUD_EMBED_URL = 'https://w.soundcloud.com/player/?url=%s';
const RUTUBE_EMBED_URL = 'https://rutube.ru/play/embed/%s?wmode=opaque';
const VK_URL = 'https://vk.com/video-%s';

function getRutubeVideoId(url: string): string | undefined {
	const regExp = /https:\/\/rutube.ru\/video\/([a-zA-Z0-9]+).*/;
	const match = url.match(regExp);
	return match && match[1] ? match[1] : undefined;
}

function getYoutubeVideoId(url: string): string | undefined {
	const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
	const match = url.match(regExp) || [];
	const id = match[7];
	if (id && id.length === 10 && url.match('v' + id)) {
		return 'v' + id;
	}
	return id && id.length === 11 ? id : undefined;
}

function getVimeoVideoId(url: string): string | undefined {
	const regExp = /^.*(www\.)?vimeo.com\/(\d+)($|\/)/;
	const match = url.match(regExp);
	return match && match[2] ? match[2] : undefined;
}

type PortfolioLinkType =
	| 'youtube'
	| 'rutube'
	| 'vk'
	| 'vimeo'
	| 'kinopoisk'
	| 'soundcloud'
	| 'google'
	| 'yandex-disk'
	| 'dropbox';

interface PortfolioParser {
	name: PortfolioLinkType;
	type: 'embed' | 'external';
	parse: (url: string) => string | undefined;
	icon?: PortfolioUrlIcon;
}

interface PortfolioUrlIcon {
	url: string;
	size?: number;
	width?: number;
	height?: number;
}

const PORTFOLIO_PARSERS: PortfolioParser[] = [
	{
		name: 'youtube',
		type: 'embed',
		parse: (url) => {
			const id = getYoutubeVideoId(url);
			return id ? YOUTUBE_EMBED_URL.replace('%s', id) : undefined;
		}
	},
	{
		name: 'rutube',
		type: 'embed',
		parse: (url) => {
			const id = getRutubeVideoId(url);
			return id ? RUTUBE_EMBED_URL.replace('%s', id) : undefined;
		}
	},
	{
		name: 'vk',
		type: 'embed',
		parse: (url) => {
			const regExp = /https:\/\/vk.com\/.*?([\-0-9]+_[0-9]+).*/;
			const match = url.match(regExp);
			return match && match[1] ? VK_URL.replace('%s', match[1]) : undefined;
		}
	},
	{
		name: 'vimeo',
		type: 'embed',
		parse: (url) => {
			const id = getVimeoVideoId(url);
			return id ? VIMEO_EMBED_URL.replace('%s', id) : undefined;
		}
	},
	{
		name: 'kinopoisk',
		type: 'external',
		icon: {
			url: kinopoiskIcon,
			width: 80,
			height: 20
		},
		parse: (url) => {
			const regExp = /https:\/\/(www|hd).kinopoisk.ru\/(series|film)\/([a-zA-Z0-9]+).*/;
			const match = url.match(regExp);
			if (match && match.length === 4) {
				const [, subdomain, type, id] = match;
				return `https://${subdomain}.kinopoisk.ru/${type}/${id}`;
			}
			return;
		}
	},
	{
		name: 'soundcloud',
		type: 'embed',
		icon: {
			url: soundcloudIcon,
			width: 64,
			height: 32
		},
		parse: (url) => {
			const trackRegExp = /(^.*(www\.)?(soundcloud.com|snd.sc)\/[a-zA-Z0-9\-]+\/[a-zA-Z0-9\-]+($|\/)).*$/;
			const playlistRegExp =
				/(^.*(www\.)?(soundcloud.com|snd.sc)\/[a-zA-Z0-9\-]+\/sets\/[a-zA-Z0-9\-]+($|\/)).*$/;
			const queryIndex = url.indexOf('?');
			const urlWithoutQuery = queryIndex > 0 ? url.slice(0, queryIndex) : url;
			const match = urlWithoutQuery.match(playlistRegExp) || urlWithoutQuery.match(trackRegExp);
			return match && match[1] ? SOUNDLOUD_EMBED_URL.replace('%s', match[1]) : undefined;
		}
	},
	{
		name: 'google',
		type: 'external',
		icon: {
			url: googleDriveIcon,
			size: 28
		},
		parse: (url) => {
			const regExp = /^https:\/\/(docs|drive).google.com/;
			return regExp.test(url) ? url : undefined;
		}
	},
	{
		name: 'yandex-disk',
		type: 'external',
		icon: {
			url: yandexDiskIcon,
			width: 48,
			height: 28
		},
		parse: (url) => {
			const regExp = /^https:\/\/disk.yandex.(ru|com|com.tr|kz|ua|by|eu|it|uz)\//;
			return regExp.test(url) ? url : undefined;
		}
	},
	{
		name: 'dropbox',
		type: 'embed',
		icon: {
			url: dropboxIcon,
			width: 100,
			height: 20
		},
		parse: (url) => {
			const regExp = /((http|https):\/\/)?(www\.)?dropbox.com\/[a-zA-Z0-9\-]+\/[a-zA-Z0-9\-]+\/[a-zA-Z0-9\-]+/;
			return regExp.test(url) ? url : undefined;
		}
	}
];

interface VimeoResponse {
	thumbnail_large?: string;
}

const cache: Record<string, string> = {};

async function getVideoThumbnail(url: string): Promise<string | undefined> {
	const youtubeId = getYoutubeVideoId(url);
	const vimeoId = getVimeoVideoId(url);
	const rutubeId = getRutubeVideoId(url);
	const cacheId = youtubeId || vimeoId;
	if (cacheId && cache[cacheId]) {
		return cache[cacheId];
	}
	if (youtubeId) {
		const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/%s.jpg`;
		cache[url] = thumbnailUrl;
		const max = thumbnailUrl.replace('%s', 'maxresdefault');
		const mq = thumbnailUrl.replace('%s', 'mqdefault');
		return request({
			method: 'GET',
			url: max,
			mode: 'no-cors'
		})
			.then(() => {
				cache[youtubeId] = max;
				return max;
			})
			.catch(() => {
				cache[youtubeId] = mq;
				return mq;
			});
	} else if (vimeoId) {
		return request<VimeoResponse[]>({
			method: 'GET',
			url: `https://vimeo.com/api/v2/video/${vimeoId}.json`,
			parser: 'json'
		})
			.then((response) => {
				const thumbnailUrl = (response || [])[0].thumbnail_large || undefined;
				if (thumbnailUrl) {
					cache[vimeoId] = thumbnailUrl;
				}
				return thumbnailUrl;
			})
			.catch(() => undefined);
	} else if (rutubeId) {
		return getPortfolioThumbnail({url}).then((data) => data?.thumbnail);
	}
	return;
}

interface PortfolioLink {
	name: PortfolioLinkType;
	type: 'external' | 'embed';
	url: string;
	icon?: PortfolioUrlIcon;
}

function parsePortfolioLink(url: string | undefined): PortfolioLink | undefined {
	if (!url) {
		return;
	}
	return PORTFOLIO_PARSERS.reduce((result, parser) => {
		if (result) {
			return result;
		}
		const resultUrl = parser.parse(url);
		if (resultUrl) {
			return {
				url: resultUrl,
				name: parser.name,
				type: parser.type,
				icon: parser.icon
			};
		}
		return;
	}, undefined);
}

function getProjectTypeTitle(types: ProjectType[], typeId: string): string {
	const type = types.find((type) => type.id === typeId);
	return type?.title || '';
}

interface Option {
	title: string;
	value: any;
}

function getPaycheckTypeTitle(value: string): string {
	return translates.paycheckType[value];
}

function getPaycheckOption(value: string): Option {
	return {
		title: upperFirst(getPaycheckTypeTitle(value)),
		value
	};
}

function getPaycheckOptions(only?: PaycheckType | null, lang = 'ru'): Option[] {
	if (only) {
		return [getPaycheckOption(only)];
	}
	return Object.values(PaycheckType).map((value) =>
		lang === 'ru' ? getPaycheckOption(value) : {title: upperFirst(value), value}
	);
}

function getApplicationsCounterFiltersValue(filter: ProjectApplicationsFilter): string {
	if (filter.status === 'invites') {
		return 'invites';
	}
	if (filter.status === 'accepted') {
		return 'accepted';
	}
	if (filter.status === 'rejected') {
		return 'rejected';
	}
	if (filter.isUnread) {
		return 'unread';
	}
	if (filter.showTest) {
		return 'test';
	}
	return 'seen';
}

const FILTER_STATUS_TYPES = ['accepted', 'rejected', 'invites', 'active'];

function getApplicationsFilter(filter: ProjectApplicationsFilter, type?: string): ProjectApplicationsFilter {
	if (!type) {
		return filter;
	}
	return {
		...filter,
		status: FILTER_STATUS_TYPES.includes(type) ? type : 'active',
		isUnread: type !== 'test' ? type === 'unread' : undefined,
		showTest: type === 'test' ? true : undefined
	};
}

export {
	getVideoThumbnail,
	parsePortfolioLink,
	getProjectTypeTitle,
	getApplicationsCounterFiltersValue,
	getApplicationsFilter,
	getPaycheckOptions
};
