import './highlighter.css';

import * as React from 'react';
import * as ReactDom from 'react-dom';
import classname from '@/common/core/classname';
import Dialog from '../dialog/dialog';
import PageTitle from '@/web/views/page-title/page-title';
import ResizeListener from '../resize-listener/resize-listener';
import {isEqual} from 'lodash';

interface RectData {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface Props {
	show: boolean;
	title?: string;
	content: React.ReactNode;
	onClose?: () => void;
}

interface State {
	show?: boolean;
	rect?: RectData;
}

const b = classname('highlighter-view');

class Highlighter extends React.Component<Props, State> {
	private _el: HTMLDivElement;
	private _childEl?: Element;

	constructor(props: Props) {
		super(props);

		this._el = document.createElement('div');
		this._el.classList.add(b());

		this.state = {
			show: props.show
		};
	}

	componentDidMount() {
		if (this.props.show) {
			this._getChild();
			this._updateSizes();
			this._appendContainer();
		}
	}

	componentDidUpdate(prevProps: Props, prevState: State) {
		const props = this.props;
		const state = this.state;
		if (prevProps.show !== props.show) {
			this.setState({show: props.show});
		}
		this._getChild();
		this._updateSizes();
		if (!prevState.show && state.show) {
			this._appendContainer();
		}
		if (prevState.show && !state.show) {
			this._removeContainer();
		}
	}

	componentWillUnmount() {
		this._removeContainer();
	}

	private _getSizes = (): RectData | undefined => {
		const rect = this._childEl?.getBoundingClientRect();
		return rect
			? {
					x: rect.x,
					y: rect.y,
					width: rect.width,
					height: rect.height
			  }
			: undefined;
	};

	private _updateSizes = (): void => {
		const rect = this._getSizes();
		if (!isEqual(this.state.rect, rect)) {
			this.setState({rect});
		}
	};

	private _appendContainer = (): void => {
		const child = this._childEl;
		if (child) {
			child.parentNode?.appendChild(this._el);
			child.classList.add(b('child'));
		}
	};

	private _removeContainer = (): void => {
		const child = this._childEl;
		if (child) {
			child.classList.remove(b('child'));
			try {
				child.parentNode?.removeChild(this._el);
			} catch (e) {
				return;
			}
		}
	};

	private _getChild = (): Element | undefined => {
		this._childEl = (ReactDom.findDOMNode(this) as Element) || undefined;
		return this._childEl;
	};

	private _onClose = (): void => {
		this.props.onClose?.();
		this.setState({show: false});
	};

	private _renderHighlight = (): React.ReactNode => {
		const state = this.state;
		if (!state.show) {
			return null;
		}
		const rect = this._getSizes();
		const style = {left: rect?.x, top: rect?.y, width: rect?.width, height: rect?.height};
		return ReactDom.createPortal(
			<>
				<div className={b('overlay')} />
				<div className={b('box')} style={style} />
				<div className={b('child-overlay')} style={style} />
			</>,
			this._el
		);
	};

	private _renderDialog = (): React.ReactNode => {
		const props = this.props;
		return (
			<Dialog className={b('dialog')} isOpen={this.state.show} onClose={this._onClose} noOverlay showClose>
				{props.title ? <PageTitle>{props.title}</PageTitle> : null}
				<div className={b('dialog-content')}>{props.content}</div>
			</Dialog>
		);
	};

	render(): React.ReactNode {
		return (
			<>
				{this.props.children}
				{this._renderHighlight()}
				{this._renderDialog()}
				<ResizeListener onResize={this._updateSizes} />
			</>
		);
	}
}

export default Highlighter;
