import React from 'react';
import {RouteComponentProps, withRouter} from 'react-router-dom';

interface SelfProps {
	id: string | undefined;
}

type Props = SelfProps & RouteComponentProps;

class View extends React.Component<Props> {
	componentDidUpdate() {
		const props = this.props;
		if (!props.id || props.location.pathname === props.location.pathname) {
			return;
		}

		const gtag = (window as any).gtag;
		if (props.history.action === 'PUSH' && typeof gtag === 'function') {
			gtag('config', props.id, {
				page_title: document.title,
				page_location: window.location.href,
				page_path: location.pathname
			});
		}
	}

	render() {
		return null;
	}
}

const GoogleAnalytics = withRouter(View);

export default GoogleAnalytics;
