import './hint.css';

import * as React from 'react';
import * as ReactDom from 'react-dom';
import classname from '@/common/core/classname';
import ChildrenWrapper from '../children-wrapper/children-wrapper';
import Portal from '../portal/portal';

type Arrange = 'left' | 'right' | 'top' | 'bottom';

interface SelfProps {
	position?: Arrange;
	content?: React.ReactNode;
}

type Props = SelfProps;

interface State {
	isShown?: boolean;
	arrange: Arrange;
	position?: Partial<ClientRect>;
}

const b = classname('hint');

class Hint extends React.PureComponent<Props, State> {
	private _target?: HTMLElement;

	constructor(props: Props) {
		super(props);

		this.state = {
			arrange: props.position || 'top'
		};
	}

	componentDidMount() {
		if (this._target) {
			this._target.addEventListener('mouseenter', this._enter);
			this._target.addEventListener('mouseleave', this._leave);
		}
	}

	componentWillUnmount() {
		if (this._target) {
			this._target.removeEventListener('mouseenter', this._enter);
			this._target.removeEventListener('mouseleave', this._leave);
		}
	}

	private _getRef = (ref?: ChildrenWrapper | null): void => {
		this._target = (ref && (ReactDom.findDOMNode(ref) as HTMLElement | null)) || undefined;
	};

	private _enter = (): void => {
		this._position();
		this.setState({isShown: true});
	};

	private _leave = (): void => {
		this.setState({isShown: false});
	};

	private _position = (): void => {
		const target = this._target;
		if (target) {
			const rect = target.getBoundingClientRect();
			switch (this.state.arrange) {
				case 'top':
					this.setState({
						position: {
							top: rect.top,
							left: rect.left + rect.width / 2
						}
					});
					break;
				case 'bottom':
					this.setState({
						position: {
							top: rect.bottom,
							left: rect.left + rect.width / 2
						}
					});
					break;
				case 'right':
					this.setState({
						position: {
							top: rect.top + rect.height / 2,
							left: rect.right
						}
					});
					break;
				case 'left':
					this.setState({
						position: {
							top: rect.top + rect.height / 2,
							left: rect.left
						}
					});
					break;
			}
		}
	};

	private _renderHint = (): React.ReactNode => {
		const props = this.props;
		const state = this.state;
		if (!state.isShown || !props.content) {
			return null;
		}

		const arrange = state.arrange;
		const position = state.position;
		return (
			<Portal>
				<div className={b({arrange})} style={position}>
					<div className={b('arrow')} />
					<div className={b('content')}>{props.content}</div>
				</div>
			</Portal>
		);
	};

	render(): React.ReactNode {
		return (
			<>
				<ChildrenWrapper ref={this._getRef}>{this.props.children}</ChildrenWrapper>
				{this._renderHint()}
			</>
		);
	}
}

export default Hint;
