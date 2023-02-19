import './avatar.css';

import React from 'react';
import classname from '@/common/core/classname';
import {User} from '@/common/types/user';

import defaultAvatar from '@/common/images/avatar.png';
import SubscriptionBadge from '../subscription-badge/subscription-badge';

interface Props {
	user?: User;
	url?: string;
	size?: number;
	show?: boolean;
}

const b = classname('avatar');

function Avatar({user, url, size, show}: Props) {
	const urlTemplate = url || user?.avatar?.urlTemplate || user?.gravatar;
	const imageUrl = urlTemplate?.replace('%s', 'md');
	const showSubscription = typeof show === 'boolean' ? show : true;
	const subscription = (showSubscription && user?.subscription?.level) || undefined;
	console.log(user)
	return (
		<div className={b({subscription, simple: show === false})} style={{width: size, height: size}}>
			<div className={b('wrapper')}>
				{user?.isVerified && <div className={b('verified')} />}

				<div className={b('real')} style={{backgroundImage: imageUrl ? `url("${imageUrl}")` : undefined}} />
				<div className={b('default')} style={{backgroundImage: `url("${defaultAvatar}")`}} />
			</div>
			{user && subscription && showSubscription ? (
				<div className={b('badge')}>
					<SubscriptionBadge user={user} />
				</div>
			) : null}
		</div>
	);
}

export default Avatar;
