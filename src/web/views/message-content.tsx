import React, {useState} from 'react';
import {useDispatch} from 'react-redux';
import {getTranslate} from '@/web/actions/chat-provider';
import chatActions from '@/web/actions/chat-actions';

const isEngLang = (str: string) => {
	const s = str.replace(/\s+/g, '');
	return /^\w+$/.test(s);
};

const MessageContent = ({classNames, message, index, renderFileContent, same, author, onClick, lang}) => {
	const [localLang, setLang] = useState(() => lang);
	const dispatch = useDispatch();

	const handleClick = () => {
		if (!message.content_en) {
			const isEng = isEngLang(message.content);
			getTranslate({messageId: message._id, lang: isEng ? 'ru' : 'en'}).then((res) => {
				dispatch(chatActions.translateMessage(res, index));
			});
		} else {
			setLang((prev) => (prev === 'en' ? 'ru' : 'en'));
		}
	};

	const text = (localLang === 'ru' ? message.content : message.content_en || message.content) || '';
	return (
		<div className={classNames[4]}>
			{same ? null : (
				<div className={classNames[3]} onClick={onClick}>
					{author.localeFullname}
				</div>
			)}
			<div className={classNames[2]}>
				{message.content ? (
					<div
						className={classNames[0]}
						dangerouslySetInnerHTML={{
							__html: parseLinks(text, classNames[0])
						}}
					/>
				) : (
					renderFileContent(message)
				)}
				<div className={classNames[1]}>{new Date(message.createdAt).toLocaleTimeString()}</div>
			</div>
			<div style={{margin: '5px'}} onClick={handleClick}>
				{localLang === 'ru' ? 'Перевести' : 'Translate'}
			</div>
		</div>
	);
};

function parseLinks(content: string, className: string): string {
	return content.replace(/https:\/\/.*?(\s|$)/, (substr) => {
		const url = new URL(substr);
		const pathname = decodeURI(url.pathname + (url.search ? `?${url.search}` : ''));
		const urlText =
			pathname.length > 20
				? url.hostname + pathname.slice(0, 8) + '...' + pathname.slice(-8)
				: substr.replace(/^https:\/\//, '');
		return `<a class="${className}-link" href="${substr}" rel="nofolow,noindex">${urlText}</a>`;
	});
}

export default MessageContent;
