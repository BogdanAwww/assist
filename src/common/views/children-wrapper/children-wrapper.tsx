import * as React from 'react';

class ChildrenWrapper extends React.PureComponent<{}> {
	render(): React.ReactNode {
		return this.props.children;
	}
}

export default ChildrenWrapper;
