import './notification-text-view.css';

import classname from '@/common/core/classname';
import {UserNotification} from '@/common/types/notification';
import * as React from 'react';
import {User} from '@/common/types/user';
import {Project} from '@/common/types/project';
import {i18nConnect, I18nProps} from '../translates-provider/translates-provider';

interface Props extends UserNotification, I18nProps {}

const b = classname('notification-text-view');

class NotificationTextView extends React.PureComponent<Props> {
	private _renderWrap = (content?: React.ReactNode) => {
		return <div className={b()}>{content}</div>;
	};

	render() {
		const t = this.props.translates;
		const item = this.props;
		const user = item.subjects.user as User;
		const project = item.subjects.project as Project;
		let text: string = t.notifications[item.type];
		if (user) {
			text = text.replace('%user', user.localeFirstname + ' ' + user.localeLastname);
		}
		if (project) {
			text = text.replace('%project', project.localeTitle || '');
		}
		return this._renderWrap(text);
	}
}

export default i18nConnect(NotificationTextView);
