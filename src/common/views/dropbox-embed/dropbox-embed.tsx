import './dropbox-embed.css';

import * as React from 'react';
import classname from '@/common/core/classname';

const b = classname('dropbox-embed');

let scriptAdded: boolean = false;
let scriptResolve;
let scriptReject;
const scriptPromise = new Promise((resolve, reject) => {
	scriptResolve = resolve;
	scriptReject = reject;
});

interface Props {
	url: string;
}

class DropboxEmbed extends React.PureComponent<Props> {
	private _ref = React.createRef<HTMLDivElement>();
	private _embed: any;

	componentDidMount() {
		addScript();
		scriptPromise.then(() => {
			const db = (window as any).Dropbox;
			if (db) {
				this._embed = db.embed({link: this.props.url}, this._ref.current);
			}
		});
	}

	componentWillUnmount() {
		const db = (window as any).Dropbox;
		if (db && this._embed) {
			db.unmount(this._embed);
		}
	}

	render(): React.ReactNode {
		return <div className={b()} ref={this._ref} />;
	}
}

function addScript(): Promise<void> {
	return new Promise(() => {
		if (!scriptAdded) {
			const script = document.createElement('script');
			script.type = 'text/javascript';
			script.src = 'https://www.dropbox.com/static/api/2/dropins.js';
			script.id = 'dropboxjs';
			script.setAttribute('data-app-key', 'qgjlb8spzud2xns');
			script.onload = () => scriptResolve();
			script.onerror = () => scriptReject();
			document.head.appendChild(script);
			scriptAdded = true;
		}
	});
}

export default DropboxEmbed;
