import './resize-listener.css';

import * as React from 'react';
import classname from '@/common/core/classname';

const b = classname('resize-listener');

interface Props {
	onResize: (event: WindowEventMap['resize']) => void;
}

class ResizeListener extends React.Component<Props> {
	private _ref = React.createRef<HTMLIFrameElement>();

	private _onResize = (e: WindowEventMap['resize']): void => {
		this.props.onResize(e);
	};

	private _onIframeLoad = (): void => {
		this._ref.current!.contentWindow!.addEventListener('resize', this._onResize);
	};

	componentDidMount(): void {
		const measurer = this._ref.current!;
		if (measurer.contentWindow) {
			this._onIframeLoad();
		} else {
			measurer.addEventListener('load', this._onIframeLoad);
		}
	}

	componentWillUnmount(): void {
		const measurer = this._ref.current;
		if (measurer) {
			measurer.removeEventListener('load', this._onIframeLoad);
			if (measurer.contentWindow) {
				measurer.contentWindow.removeEventListener('resize', this._onResize);
			}
		}
	}

	render(): React.ReactNode {
		return <iframe className={b()} tabIndex={-1} ref={this._ref} />;
	}
}

export default ResizeListener;
