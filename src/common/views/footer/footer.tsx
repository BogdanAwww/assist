import './footer.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import LinkWrapper from '@/common/views/link-wrapper/link-wrapper';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';

import instagramRoundIconUrl from '@/common/icons/instagram-round.svg';
import facebookRoundIconUrl from '@/common/icons/facebook-round.svg';
import telegramRoundIconUrl from '@/common/icons/telegram-round.svg';

interface Props extends I18nProps {
	static?: boolean;
	hide?: boolean;
}

const b = classname('footer');

class Footer extends React.PureComponent<Props> {
	render(): React.ReactNode {
		const props = this.props;
		const t = props.translates;
		if (props.hide) {
			return null;
		}
		return (
			<div className={b({static: props.static})}>
				<div className={b('text')}>
					<div>Copyright &copy; Assist 2021.</div>
					<div>{t.copyright}</div>
				</div>
				<div className={b('social')}>
					<a title="Instagram" href="https://instagram.com/assist.video" target="_blank" rel="noreferrer">
						<SvgIcon url={instagramRoundIconUrl} width={24} height={24} />
					</a>
					<a title="Facebook" href="https://facebook.com/assist.video/" target="_blank" rel="noreferrer">
						<SvgIcon url={facebookRoundIconUrl} width={24} height={24} />
					</a>
					<a title="Telegram" href="https://t.me/assist_video" target="_blank" rel="noreferrer">
						<SvgIcon url={telegramRoundIconUrl} width={24} height={24} />
					</a>
					<LinkWrapper className={b('faq')} url="/faq">
						FAQ
					</LinkWrapper>
					<div className={b('translates')}>
						<span
							className={b('lang', {active: props.lang === 'ru'})}
							onClick={() => props.setLanguage('ru')}
						>
							RU
						</span>
						<span>/</span>
						<span
							className={b('lang', {active: props.lang === 'en'})}
							onClick={() => props.setLanguage('en')}
						>
							EN
						</span>
					</div>
				</div>
			</div>
		);
	}
}

export default i18nConnect(Footer);
