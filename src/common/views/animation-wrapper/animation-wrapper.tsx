import * as React from 'react';
import * as ReactDom from 'react-dom';
import {capitalize} from 'lodash-es';

interface Props {
	onShow?: () => void;
	onHideStart?: () => void;
	onHideEnd?: () => void;
	children: React.ReactNode;
}

interface State {
	content: React.ReactNode;
}

const animationEnd = getEventEndName('animation');
const transitionEnd = getEventEndName('transition');

class AnimationWrapper extends React.Component<Props, State> {
	private _node: Element | null = null;

	constructor(props: Props) {
		super(props);
		this.state = {content: props.children};
	}

	componentDidMount(): void {
		if (this.props.children) {
			this.setState({content: this.props.children}, this.props.onShow);
		}
	}

	componentDidUpdate(prevProps: Props): void {
		const nextChildren = this.props.children;
		if (nextChildren) {
			if (nextChildren !== prevProps.children) {
				if (this._node) {
					this._removeListeners(this._node);
					this._node = null;
				}
				this.setState({content: nextChildren}, this.state.content ? undefined : this.props.onShow);
			}
		} else {
			const node = this._getNode();
			if (node) {
				this._addListeners(node);
				this._node = node;
				node.classList.add('_animation-hide');
			}
			if (this.props.onHideStart) {
				this.props.onHideStart();
			}
		}
	}

	componentWillUnmount(): void {
		if (this._node) {
			this._removeListeners(this._node);
		}
	}

	private _getNode = (): Element | null => {
		const maybeNode = ReactDom.findDOMNode(this);
		if (maybeNode instanceof Element) {
			return maybeNode;
		}
		return null;
	};

	private _addListeners = (node: Element): void => {
		if (animationEnd) {
			node.addEventListener(animationEnd, this._onHideAnimationEnd);
		}
		if (transitionEnd) {
			node.addEventListener(transitionEnd, this._onHideAnimationEnd);
		}
	};

	private _removeListeners = (node: Element): void => {
		if (animationEnd) {
			node.removeEventListener(animationEnd, this._onHideAnimationEnd);
		}
		if (transitionEnd) {
			node.removeEventListener(transitionEnd, this._onHideAnimationEnd);
		}
		node.classList.remove('_animation-hide');
	};

	private _onHideAnimationEnd = (e: Event): void => {
		const node = e.currentTarget as Element;
		this._removeListeners(node);
		this._node = null;
		this.setState({content: null}, this.props.onHideEnd);
	};

	render(): React.ReactNode {
		return this.state.content;
	}
}

function getPropertyName(property: string): string {
	return property
		.split('-')
		.map((part) => capitalize(part))
		.join('');
}

function getPrefix(property: string): string | null {
	const testElement = window.document.createElement('div');
	if (typeof testElement.style[property as keyof CSSStyleDeclaration] !== 'undefined') {
		return '';
	}

	if (typeof testElement.style[('webkit' + getPropertyName(property)) as keyof CSSStyleDeclaration] !== 'undefined') {
		return 'webkit';
	}

	if (typeof testElement.style[('Moz' + getPropertyName(property)) as keyof CSSStyleDeclaration] !== 'undefined') {
		return 'Moz';
	}

	if (typeof testElement.style[('ms' + getPropertyName(property)) as keyof CSSStyleDeclaration] !== 'undefined') {
		return 'ms';
	}

	return null;
}

function getEventEndName(property: string): string | null {
	const prefix = getPrefix(property);
	return prefix ? prefix + capitalize(property) + 'End' : prefix !== null ? property + 'end' : null;
}

export default AnimationWrapper;
