export function parseJSON(data: any): any {
	try {
		return JSON.parse(data);
	} catch (e) {
		return undefined;
	}
}
