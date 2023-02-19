import * as React from 'react';

const subdomain = 'mongraphs';
const host = `${subdomain}.assist.video`;

class MonitoringsPage extends React.PureComponent {
	render(): React.ReactNode {
		const url = `https://${host}/grafana/d/S7ARwalMz/assist?orgId=1&refresh=5m&from=now-7d&to=now&kiosk`;
		return <iframe width="100%" height="800px" src={url} />;
	}
}

export default MonitoringsPage;
