import './background-main.css';
import React from 'react';
import {useRouteMatch} from 'react-router-dom';
import classname from '@/common/core/classname';
import Proportion from '@/common/views/proportion/proportion';
import Logo from '@/common/views/logo/logo';
import LinkWrapper from '@/common/views/link-wrapper/link-wrapper';
import {i18nConnect, I18nProps} from '../translates-provider/translates-provider';

const b = classname('background-main');

const BackgroundMain: React.FC<I18nProps> = (props) => {
	const isNotAuthPages = useRouteMatch('/choose-role');
	return (
		<div className={b()}>
			<div className={b('logo')}>
				{isNotAuthPages ? (
					<Logo />
				) : (
					<LinkWrapper url="https://assist.video">
						<Logo />
					</LinkWrapper>
				)}
			</div>
			<div className={b('half-black')} />
			<div className={b('hand-left')}>
				<Proportion className={b('hand-left-inner')} w={245} h={160} />
			</div>
			<div className={b('hand-right')}>
				<div className={b('red-dot')}>
					<Proportion />
				</div>
				<Proportion className={b('hand-right-inner')} w={482} h={327} />
			</div>
			<div className={b('pattern1')}>
				<Proportion className={b('pattern-inner')} />
			</div>
			<div className={b('pattern2')}>
				<Proportion className={b('pattern-inner')} />
			</div>
			<div className={b('text1')}>{props.translates.backgroundMain.text}</div>
			<div className={b('wrapper')}>{props.children}</div>
		</div>
	);
};

export default i18nConnect(BackgroundMain);
