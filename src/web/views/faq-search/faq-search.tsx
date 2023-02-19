import './faq-search.css';

import React, {useContext, useState} from 'react';
import Label from '@/common/views/label/label';
import Input from '@/common/views/input/input';
import Button from '@/common/views/button/button';
import {TranslatesContext} from '@/common/views/translates-provider/translates-provider';

import classname from '@/common/core/classname';

const b = classname('faq-search');

interface Props {
	handleClick: (value: string) => void;
}

const FAQSearch: React.FC<Props> = ({handleClick}) => {
	const [value, setValue] = useState<string>('');
	const {translates: t} = useContext(TranslatesContext);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setValue(e.target.value);
	};

	return (
		<div className={b('input-wrapper')}>
			<div className={b('input')}>
				<Label text={t.faqSearch?.[0]} />
				<Input placeholder={t.faqSearch?.[1]} size="medium" onChange={handleChange} />
			</div>
			<Button className={b('button')} text={t['search']} onClick={() => handleClick(value)} />
		</div>
	);
};

export default FAQSearch;
