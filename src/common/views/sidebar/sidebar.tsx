import './sidebar.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import Portal from '../portal/portal';
import AnimationWrapper from '../animation-wrapper/animation-wrapper';

interface Props {
	isOpen: boolean;
	onClose?: () => void;
	compact?: boolean;
}

const b = classname('sidebar');

class Sidebar extends React.Component<Props> {
	private _ref = React.createRef<HTMLDivElement>();

	componentDidMount() {
		this._focus();
	}

	componentDidUpdate(prevProps: Props) {
		if (!prevProps.isOpen && this.props.isOpen) {
			this._focus();
		}
	}

	private _focus = (): void => {
		setTimeout(() => {
			const element = this._ref?.current;
			if (element) {
				element.focus();
			}
		});
	};

	private _renderSidebar = (): React.ReactNode => {
		const props = this.props;
		return (
			<div className={b({compact: props.compact})} tabIndex={1} ref={this._ref}>
				<div className={b('overlay')} onClick={props.onClose} />
				<div className={b('content')}>{props.children}</div>
			</div>
		);
	};

	render(): React.ReactNode {
		const props = this.props;
		return (
			<Portal>
				<AnimationWrapper>{props.isOpen ? this._renderSidebar() : null}</AnimationWrapper>
			</Portal>
		);
	}
}

export default Sidebar;
