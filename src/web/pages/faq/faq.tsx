import './faq.css';

import React, {useState, useContext} from 'react';

import classname from '@/common/core/classname';
import Label from '@/common/views/label/label';
import Button from '@/common/views/button/button';
import FAQItem from '@/web/views/faq-item/faq-item';
import FAQSearch from '@/web/views/faq-search/faq-search';
import FAQDialog from '@/web/views/faq-dialog/faq-dialog';
import {TranslatesContext} from '@/common/views/translates-provider/translates-provider';

import {data_ru} from './data_ru';
import {data_en} from './data_en';

const b = classname('faq');

const FAQPage: React.FC = () => {
	const [search, setSearch] = useState<string>('');
	const [open, setOpen] = useState<boolean>(false);
	const {lang, translates: t} = useContext(TranslatesContext);

	const handleClick = (value: string): void => {
		setSearch(value);
	};

	const closeDialog = () => {
		setOpen(false);
	};

	const showDialog = () => {
		setOpen(true);
	};

	const filteredItems = (data) => {
		const regExp = new RegExp(search);
		return data.filter((el) => el.question.toLowerCase().match(regExp));
	};

	return (
		<div className={b('container')}>
			<h2 className={b('title')}>{t['faqTitle']}</h2>
			<FAQSearch handleClick={handleClick} />
			<ul className={b('qa-list')}>
				{filteredItems(lang === 'ru' ? data_ru : data_en).map((el, i) => (
					<FAQItem question={el.question} answer={el.answer} faqId={i} key={i} />
				))}
			</ul>
			<div className={b('bottom')}>
				<Label className={b('bottom-label')} text={t['faqBottomLabel']} />
				<Button className={b('button')} onClick={showDialog} text={t['faqWriteToUs']} view="bordered" />
			</div>
			<FAQDialog open={open} onClose={closeDialog} />
		</div>
	);
};

export default FAQPage;
