import './dialog.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import Portal from '../portal/portal';
import AnimationWrapper from '../animation-wrapper/animation-wrapper';
import IconClose from '../icon-close/icon-close';

interface Props {
	isOpen: boolean | undefined;
	className?: string;
	style?: React.CSSProperties;
	onClose?: () => void;
	showClose?: boolean;
	overlayClose?: boolean;
	noPadding?: boolean;
	noOverlay?: boolean;
}

const b = classname('dialog');

class Dialog extends React.PureComponent<Props> {
	private _renderDialog = (): React.ReactNode => {
		const props = this.props;
		if (!props.isOpen) {
			return null;
		}
		return (
			<div className={b({'no-overlay': props.noOverlay})}>
				{!props.noOverlay ? (
					<div className={b('overlay')} onClick={props.overlayClose ? props.onClose : undefined} />
				) : null}
				<div
					className={[b('container'), props.className].filter(Boolean).join(' ')}
					style={props.style}
					tabIndex={1}
				>
					{props.showClose ? (
						<div className={b('close')} onClick={props.onClose}>
							<IconClose hoverable />
						</div>
					) : null}
					<div className={b('content', {'no-padding': props.noPadding})}>{props.children}</div>
				</div>
			</div>
		);
	};

	render(): React.ReactNode {
		return (
			<Portal>
				<AnimationWrapper>{this._renderDialog()}</AnimationWrapper>
			</Portal>
		);
	}
}

export default Dialog;
