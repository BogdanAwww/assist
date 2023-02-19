interface RequestParams {
	url: string;
	query?: Record<string, string | unknown>;
	method?: string;
	body?: BodyInit;
	headers?: Record<string, string>;
	mode?: RequestMode;
	credentials?: RequestCredentials;
	jsonp?: boolean;
	parser?: 'string' | 'arrayBuffer' | 'json';
}

function request<T = unknown>(params: RequestParams): Promise<T> {
	const fetchParams: RequestInit = {
		method: params.method || 'GET',
		mode: params.mode || 'cors',
		credentials: params.credentials || 'same-origin',
		redirect: 'follow'
	};

	if (params.headers) {
		fetchParams.headers = Object.entries(params.headers);
	}

	if (params.body) {
		fetchParams.body = params.body;
	}

	return window
		.fetch(params.url, fetchParams)
		.then(checkStatus)
		.then((response) => {
			if (params.parser === 'arrayBuffer') {
				return response.arrayBuffer();
			}
			if (params.parser === 'string') {
				return response.text();
			}

			const contentType = response.headers.get('Content-Type');
			if ((contentType && contentType.includes('application/json')) || params.parser === 'json') {
				return response.json();
			}

			return response.text();
		});
}

function checkStatus(response: Response): Response {
	if (response.ok || (response.status >= 200 && response.status < 300)) {
		return response;
	}
	throw new Error(response.statusText);
}

export default request;
