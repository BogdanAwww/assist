const UTMS_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const;

type UTMKey = typeof UTMS_KEYS[number];
type UTMData = Partial<Record<UTMKey, string>>;

function readUTMS(): UTMData {
	const keyvalues = decodeURIComponent(window.location.search.substring(1))
		.split('&')
		.map((kv) => kv.split('=') as [string, string]);
	return keyvalues.reduce((memo, [key, value]) => {
		if ((UTMS_KEYS as readonly string[]).includes(key)) {
			memo[key] = value;
		}
		return memo;
	}, {});
}

function rememberUTMS(): void {
	const utms = readUTMS();
	if (Object.keys(utms).length > 0) {
		localStorage.setItem('utms', JSON.stringify(utms));
	}
}

export {rememberUTMS};
