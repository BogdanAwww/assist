import './faq-item.css';

import React, {useState, useEffect} from 'react';
import {useParams} from 'react-router';
import classname from '@/common/core/classname';

const b = classname('faq-item');

interface Props {
	question: string;
	answer: string;
	faqId: number;
}

const FAQItem: React.FC<Props> = ({question, answer, faqId}) => {
	const [open, setOpen] = useState<boolean>(false);
	const {id} = useParams<{id: string | undefined}>();

	useEffect(() => {
		if (id && +id === faqId) {
			setOpen(true);
		}
	}, []);

	return (
		<li className={b('item')} onClick={() => setOpen(!open)}>
			<div className={b('question')}>
				<div className={b('icon', {open})}>+</div>
				{question}
			</div>
			<div className={b('answer', {open})}>{answer}</div>
		</li>
	);
};

export default React.memo(FAQItem);
