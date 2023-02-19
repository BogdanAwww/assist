import React from 'react';
import {useHistory} from 'react-router-dom';

import classname from '@/common/core/classname';
import './link-wrapper.css';

interface Props {
	url: string;
	className?: string;
	target?: string;
	rel?: string;

	disabled?: boolean;
	stopPropagation?: boolean;
	link?: boolean;
	children: React.ReactNode;
	onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const b = classname('link-wrapper');

const LinkWrapper = (props: Props) => {
	const history = useHistory();

	const onClick = (e: React.MouseEvent<HTMLAnchorElement>): void => {
		const url = props.url;
		props.onClick?.(e);
		if (props.stopPropagation) {
			e.stopPropagation();
		}
		if (props.disabled) {
			e.preventDefault();
			return;
		}
		if (!props.target && !url.startsWith('http')) {
			e.preventDefault();
			history.push(url);
		}
	};

	return (
		<a
			className={[b({link: props.link}), props.className].filter(Boolean).join(' ')}
			href={props.url}
			onClick={onClick}
			target={props.target}
			rel={props.rel || 'noreferrer'}
		>
			{props.children}
		</a>
	);
};

export default LinkWrapper;
