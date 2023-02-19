import {createBrowserHistory, History} from 'history';

class HistoryManager {
	private _history?: History;

	init(basename?: string) {
		this._history = createBrowserHistory({
			basename
		});
	}

	get(): History {
		return this._history!;
	}

	push(path: string, state?: object): void {
		this._history?.push(path, state);
	}
}

const history = new HistoryManager();

export default history;
