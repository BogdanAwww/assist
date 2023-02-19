import * as React from 'react';
import * as ReactDom from 'react-dom';

interface Props {
	selector?: string;
	containerRef?: React.RefObject<HTMLElement>;
	strict?: boolean;
	update?: boolean;
}

interface State {
	container?: Element;
}

class Portal extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		if (typeof window !== 'undefined') {
			this.state = {
				container: this._getContainer()
			};
		} else {
			this.state = {};
		}
	}

	componentDidMount(): void {
		if (!this.state.container) {
			this.setState({
				container: this._getContainer()
			});
		}
	}

	componentDidUpdate(): void {
		if (this.props.update && !this.state.container) {
			this.setState({
				container: this._getContainer()
			});
		}
	}

	private _getContainer = (): Element | undefined => {
		const props = this.props;
		if (props.containerRef?.current) {
			return props.containerRef.current || undefined;
		}
		if (props.selector) {
			return window.document.querySelector(props.selector) || undefined;
		}
		return props.strict ? undefined : window.document.body;
	};

	render(): React.ReactNode {
		const state = this.state;
		return state.container ? ReactDom.createPortal(this.props.children, state.container) : null;
	}
}

export default Portal;
