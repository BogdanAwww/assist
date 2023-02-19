import _ from 'lodash';
import path from 'path';
import fs from 'fs';
import mailgun, {Mailgun} from 'mailgun-js';
import MJML from 'mjml';
import config, {isProduction} from '@/server/config';
import {MailLogModel} from '@/server/schema/entities/MailLogTC';
import {userFindOne} from '@/server/vendor/user/userFindOne';
import {TemplateType, TemplateData} from './types';
import {getHostUrl} from '@/server/utils/host-utils';

_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

const FROM = {
	robot: 'Assist. <no-reply@assist.video>',
	feedback: 'Assist. <feedback@assist.video>'
};
const TEMPLATES_DIR = path.join(__dirname, 'mjml');
const EXT_REGEXP = /\.mjml$/;
const FILENAME_REGEXP = /(.*?)\.mjml$/;

const IMAGES = {
	logo: getHostUrl() + '/images/logo.png'
};

const TEMPLATES_SUBJECTS: Record<TemplateType, string> = {
	'verify-account': 'Добро пожаловать на платформу Assist!',
	'welcome-verified': 'Добро пожаловать на платформу Assist!',
	'verify-account-second': 'Подтверждение учетной записи Assist',
	'restore-password': 'Восстановление пароля',
	'project-invite': 'Вас пригласили на проект',
	'application-reject': 'Заявка на проект «{{projectTitle}}» отклонена',
	'application-accept': 'Вас выбрали исполнителем проекта «{{projectTitle}}»',
	'show-test': 'Вам отправлено тестовое задание',
	'friend-invite': 'Ваш друг приглашает на платформу Assist',
	'after-signup': 'Ваша почта подтверждена. Приступим?',
	'quota-exceeded-projects': ' Вы исчерпали лимит по проектам',
	'quota-exceeded-applications': ' Вы исчерпали лимит по заявкам',
	'quota-exceeded-boosts': ' Вы исчерпали лимит по поднятию в топ проектов',
	'sub-expiration': 'Заканчивается подписка',
	'first-role-employer': 'Опубликуем проект?',
	'first-role-contractor': 'Заполним портфолио?',
	'promo-70': 'Подарочная Premium-подписка на 3 месяца со скидкой 70% 🎁',
	'signin-problems': 'Помощь с входом на платформу Assist',
	'remember-verify': 'Подтвердите почту',
	'project-application': '{{fullName}} откликнулся на проект «{{projectTitle}}»',
	'project-finished': 'Обратная связь по завершению проекта «{{projectTitle}}»',
	'project-for-contractor': 'Появился подходящий проект для вас',
	'unread-messages': 'У вас есть непрочитанные сообщения'
};

interface TemplateOptions {
	html: _.TemplateExecutor;
	subject: _.TemplateExecutor;
}

interface SendOptions {
	skipUserCheck?: boolean;
	from?: 'robot' | 'feedback';
}

class Mailer {
	private _client: Mailgun;
	private _templates: Record<string, TemplateOptions>;

	constructor() {
		this._client = mailgun(config.mailgun);
		this._templates = this._getTemplates();
	}

	private _getTemplates(): Record<string, TemplateOptions> {
		return fs
			.readdirSync(TEMPLATES_DIR)
			.filter((filename) => EXT_REGEXP.test(filename))
			.reduce((acc, filename) => {
				const parts = filename.match(FILENAME_REGEXP);
				const name = parts?.[1];
				if (!name) {
					return acc;
				}

				const filepath = path.join(TEMPLATES_DIR, filename);
				const content = fs.readFileSync(filepath, 'utf8');
				return {
					...acc,
					[name]: {
						html: _.template(MJML(content, {filePath: filepath}).html),
						subject: _.template(TEMPLATES_SUBJECTS[name] || '')
					}
				};
			}, {} as Record<string, TemplateOptions>);
	}

	public async send<T extends TemplateType>(
		templateName: T,
		to: string,
		data: TemplateData<T>,
		options: SendOptions = {}
	): Promise<any> {
		return new Promise(async (resolve, reject) => {
			const template = this._templates[templateName];

			if (!template) {
				throw new Error("Could'n find mail template");
			}

			const templateData = _.merge(data, {images: IMAGES, host: getHostUrl()});
			const messageData = {
				from: FROM[options.from || 'robot'],
				to: to,
				subject: template.subject(templateData),
				text: '',
				html: template.html(templateData)
			};

			const userFilter: any = {email: to};
			if (!isProduction) {
				userFilter['_info.migrateId'] = {$exists: false};
			}

			const user = await userFindOne(userFilter);
			if (!to || (!user && !options.skipUserCheck)) {
				resolve(undefined);
				return;
				// throw new Error('Couldn\'t find user to mail');
			}

			const ml = new MailLogModel({
				user: user?._id.toString(),
				email: to,
				template: templateName,
				data: _.omit(data, 'password')
			});

			this._client.messages().send(messageData, function (error, body) {
				if (error) {
					reject(error);
					return;
				}
				ml.set('mailgunId', body.id);
				ml.set('status', 'sent');
				ml.save();
				resolve(undefined);
			});
		}).catch((error) => {
			console.log(error);
		});
	}
}

const mailgunMailer = new Mailer();

export default mailgunMailer;
