import {SubscriptionLevel, User} from '@/common/types/user';
import * as React from 'react';
import Badge, {BadgeProps} from '../badge/badge';

interface Props {
	user?: User;
	size?: 'xs' | 'medium' | 'xl' | 'xxl';
	level?: SubscriptionLevel;

	premium?: boolean;
	stretched?: boolean;
}

const LEVEL_COLORS: Record<SubscriptionLevel, BadgeProps['view'] | undefined> = {
	start: undefined,
	basic: 'yellow',
	premium: 'primary'
};

class SubscriptionBadge extends React.PureComponent<Props> {
	render(): React.ReactNode {
		const props = this.props;
		const user = props.user;
		const subscriptionLevel = user?.subscription?.level;
		const level = props.premium ? 'premium' : subscriptionLevel || props.level;
		if (!level) {
			return null;
		}
		const view = LEVEL_COLORS[level] || 'dark';
		return <Badge view={view} size={props.size || 'xs'} title={level?.toUpperCase()} stretched={props.stretched} />;
	}
}

export default SubscriptionBadge;
