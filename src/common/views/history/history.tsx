import * as React from 'react';
import {withRouter, RouteComponentProps} from 'react-router-dom';

interface Props extends RouteComponentProps {
	children: (props: RouteComponentProps) => React.ReactNode;
}

class HistoryWrapper extends React.Component<Props> {
	render(): React.ReactNode {
		const props = this.props;
		return props.children(props);
	}
}

export default withRouter(HistoryWrapper);
