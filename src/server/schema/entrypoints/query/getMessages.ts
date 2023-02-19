import {Document} from 'mongoose';
import {Context} from '@/server/modules/context';
import {schemaComposer} from 'graphql-compose';
import {ChatMessageUTC} from '../../entities/ChatMessageTC';
import {messagesFindMany} from '@/server/vendor/chat/messagesFindMany';
import {getTranslation} from '@/server/modules/translates';

const GetMessagesTC = schemaComposer.createObjectTC({
	name: 'GetMessages',
	fields: {
		items: ChatMessageUTC.NonNull.List,
		count: 'Int',
		hasItemsBefore: 'Boolean',
		hasItemsAfter: 'Boolean'
	}
});

const DEFAULT_PER_PAGE = 20;

export default {
	type: GetMessagesTC,
	args: {
		roomId: 'String!',
		ts: 'String',
		direction: 'String',
		perPage: 'Int'
	},
	resolve: async (_, {roomId, ts, direction, perPage}, ctx: Context) => {
		const user = ctx.auth.getUser();
		if (user) {
			const fetchDirection = direction || 'before';
			const timestamp = ts || new Date().getTime();
			const limit = perPage || DEFAULT_PER_PAGE;
			return Promise.all([
				messagesFindMany({filter: {roomId, before: timestamp}, limit: limit + 1, sort: {_id: -1}}),
				messagesFindMany({filter: {roomId, after: timestamp}, limit: limit + 1, sort: {id: 1}}),
				messagesFindMany({filter: {roomId}, count: true})
			]).then(async ([itemsBefore, itemsAfter, count]) => {
				const items = await getLocalizedMessages(
					(fetchDirection === 'before' ? itemsBefore : itemsAfter).slice(0, limit),
					ctx.lang
				);
				return {
					items,
					count,
					hasItemsBefore: fetchDirection === 'before' ? itemsBefore.length > limit : itemsBefore.length > 0,
					hasItemsAfter: fetchDirection === 'after' ? itemsAfter.length > limit : itemsAfter.length > 0
				};
			});
		}
		return;
	}
};

async function getLocalizedMessages(items: Document[], lang: string) {
	const notTranslated = items.filter((item) => !item.get('content_en'));
	if (notTranslated.length > 1 && lang === 'en') {
		const translated = await Promise.all(
			notTranslated.map((message) => {
				return getTranslation(message.get('content'), 'en')
					.then((translatedContent) => {
						message.set('content_en', translatedContent);
						return message.save();
					})
					.catch(() => message);
			})
		);
		return items.map((item) => {
			if (!item.get('content_en')) {
				return translated.find((lookupItem) => lookupItem._id === item._id) || item;
			}
			return item;
		});
	}
	return items;
}
