import got from 'got';

interface ParseResult {
	thumbnail?: string;
	iframe?: string;
}

function getRutubeVideoId(url: string): string | undefined {
	const regExp = /https:\/\/rutube.ru\/video\/([a-zA-Z0-9]+).*/;
	const match = url.match(regExp);
	return match && match[1] ? match[1] : undefined;
}

function getVKId(url: string): string | undefined {
	const regExp = /https:\/\/vk.com\/.*?([\-0-9]+_[0-9]+).*/;
	const match = url.match(regExp);
	return match && match[1] ? match[1] : undefined;
}

const RUTUBE_URL = 'https://rutube.ru/video/%s/';

const VK_ACCESS_TOKEN = '06f5eb553134737a231405267e23074922be025b4b8277a9350e920f7a335e6368c6edbc5b36d3537fcc1';

export async function getPortfolioThumbnail(url: string | undefined): Promise<ParseResult> {
	if (!url) {
		return {};
	}
	const rutubeId = getRutubeVideoId(url);
	if (rutubeId) {
		const pageUrl = RUTUBE_URL.replace('%s', rutubeId);
		const response = await got<{thumbnail_url: string}>(`http://rutube.ru/api/oembed/?url=${pageUrl}&format=json`, {
			responseType: 'json'
		});
		return {
			thumbnail: response?.body?.thumbnail_url,
			iframe: undefined
		};
	}
	const vkId = getVKId(url);
	if (vkId) {
		const response = await got(
			`https://api.vk.com/method/video.get?videos=${vkId}&access_token=${VK_ACCESS_TOKEN}&v=5.130`,
			{
				responseType: 'json'
			}
		);
		const body = response?.body as any;
		const data = body?.response?.items?.[0];
		const image = (data?.image || []).filter((item) => item.width > 300 && item.width < 1000).pop();
		const firstFrame = (data?.first_frame || []).filter((item) => item.width > 300 && item.width < 1000).pop();
		const thumbnail = image?.url || firstFrame?.url;
		const iframe = data?.player;
		return {
			thumbnail,
			iframe
		};
	}
	return {};
}
