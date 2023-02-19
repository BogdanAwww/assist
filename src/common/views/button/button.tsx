import './button.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import {formContext} from '@/common/views/form/form';
import LinkWrapper from '../link-wrapper/link-wrapper';

const b = classname('button');

interface Props {
	className?: string;
	type?: 'submit';
	view?: 'primary' | 'secondary' | 'dark' | 'bordered' | 'bordered-white' | 'bordered-red' | 'invisible';
	size?: 'small' | 'medium' | 'large';
	text?: string;
	icon?: React.ReactNode;
	roundSize?: 'small' | 'medium' | 'large' | 'full';

	url?: string;
	onClick?: () => void;

	disabled?: boolean;
	minWidth?: boolean;
	stretched?: boolean;
	badge?: boolean;
}

class Button extends React.Component<Props> {
	private _renderContent = () => {
		const props = this.props;
		return (
			<>
				{props.icon ? <div className={b('icon')}>{props.icon}</div> : null}
				<span className={b('text')}>{props.text}</span>
			</>
		);
	};

	private _renderButton = (disabled?: boolean): React.ReactNode => {
		const props = this.props;
		const className = [
			b({
				view: props.view || 'primary',
				size: props.size || 'medium',
				'round-size': props.roundSize || 'full',
				disabled: disabled || props.disabled,
				'min-width': props.minWidth,
				stretched: props.stretched,
				'no-text': props.icon && !props.text,
				'is-link': Boolean(props.url),
				'as-badge': props.badge
			}),
			props.className
		]
			.filter(Boolean)
			.join(' ');
		if (props.url) {
			return (
				<LinkWrapper
					url={props.url}
					className={className}
					disabled={props.disabled}
					onClick={disabled || props.disabled ? undefined : props.onClick}
				>
					{this._renderContent()}
				</LinkWrapper>
			);
		}
		return (
			<button
				type={props.type}
				className={className}
				onClick={disabled || props.disabled ? undefined : props.onClick}
				// disabled={disabled || props.disabled}
			>
				{this._renderContent()}
			</button>
		);
	};

	render(): React.ReactNode {
		return <formContext.Consumer>{(disabled) => this._renderButton(disabled)}</formContext.Consumer>;
	}
}

export default Button;
