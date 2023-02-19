import './faq-dialog.css';

import React, {useContext, useState} from 'react';
import Dialog from '@/common/views/dialog/dialog';
import Label from '@/common/views/label/label';
import Input from '@/common/views/input/input';
import Textarea from '@/common/views/textarea/textarea';
import Button from '@/common/views/button/button';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import complete from '@/common/icons/complete.svg';
import classname from '@/common/core/classname';
import {TranslatesContext} from '@/common/views/translates-provider/translates-provider';

interface Props {
	open: boolean;
	onClose: () => void;
}

const b = classname('faq-dialog');

const FAQDialog: React.FC<Props> = ({open, onClose}) => {
	const [submit, setSubmit] = useState<boolean>(false);
	const {translates: t} = useContext(TranslatesContext);

	const handleClick = () => {
		setSubmit(true);
	};

	const close = () => {
		onClose();
		setSubmit(false);
	};

	return (
		<Dialog isOpen={open} onClose={close} showClose overlayClose>
			<div className={b('container')}>
				<h2 className={b('title')}>{t.faqDialog?.[0]}</h2>
				<Label text={t.faqDialog?.[1]} />
				<Input placeholder={t.faqDialog?.[2]} />
				<Label text={t.faqDialog?.[3]} />
				<Textarea placeholder={t.faqDialog?.[4]} rows={5} maxlength={290} />
				<Button onClick={handleClick} className={b('button')} text={t.faqDialog?.[5]} />
			</div>
			{submit && (
				<div className={b('splash-screen')}>
					<SvgIcon url={complete} noFill />
					<div className={b('splash-screen-message')}>
						<div className={b('splash-screen-title')}>{t.faqDialog?.[6]}</div>
						<div className={b('splash-screen-subtitle')}>{t.faqDialog?.[7]}</div>
					</div>
				</div>
			)}
		</Dialog>
	);
};

export default FAQDialog;
