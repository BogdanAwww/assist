import mailgunMailer from '@/server/modules/mail';
import {ActionConfirmModel} from '@/server/schema/entities/ActionConfirmTC';
import {getHostUrl} from '@/server/utils/host-utils';
import {Document} from 'mongoose';

interface Options {
	password?: string;
	remember?: boolean;
}

const VERIFICATION_EXPIRATION = 30 * 24 * 60 * 60 * 1000;

export async function sendVerification(user: Document, options: Options = {}) {
	const actionConfirm = new ActionConfirmModel({
		user: user._id,
		action: 'verify-account',
		expire: Number(new Date()) + VERIFICATION_EXPIRATION
	});
	const savedActionConfirm = await actionConfirm.save();
	const link = getHostUrl() + '/verify?hash=' + savedActionConfirm.get('hash');
	const email = user.get('email');
	if (user.get('verified') && options.password) {
		mailgunMailer.send('welcome-verified', email, {password: options.password});
	} else if (options.remember) {
		mailgunMailer.send('remember-verify', email, {link});
	} else if (options.password) {
		mailgunMailer.send('verify-account', email, {link, password: options.password});
	} else {
		mailgunMailer.send('verify-account-second', email, {link});
	}
}
