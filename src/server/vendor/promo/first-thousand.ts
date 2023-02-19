import mailgunMailer from '@/server/modules/mail';
import {getHostUrl} from '@/server/utils/host-utils';
import {createPromoCode} from '@/server/vendor/promocode/createPromoCode';
import {Document} from 'mongoose';

export async function firstThousandCheck(user: Document) {
	const {utm_source, utm_campaign} = user.get('_info.utms') || {};
	if (utm_source === 'bot' && utm_campaign === 'signup') {
		const promo = await createPromoCode({user: user._id, template: 'telegram-signup'});
		const code = promo?.get('code');
		if (code) {
			mailgunMailer.send('promo-70', user.get('email'), {
				code: code.toUpperCase(),
				link: getHostUrl() + '/subscription'
			});
		}
	}
}
