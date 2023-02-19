import './cookies-view.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import Button from '@/common/views/button/button';
import {translates} from '@/common/views/translates-provider/translates-provider';

interface State {
	isAccepted: boolean;
}

const b = classname('cookies-view');

class View extends React.PureComponent<{}, State> {
	constructor(props: {}) {
		super(props);

		this.state = {
			isAccepted: Boolean(localStorage.getItem('cookies-accepted'))
		};
	}

	private _accept = (): void => {
		localStorage.setItem('cookies-accepted', 'true');
		this.setState({isAccepted: true});
	};

	render(): React.ReactNode {
		if (this.state.isAccepted) {
			return null;
		}
		return (
			<div className={b()}>
				{translates.cookiesDisclaimer}
				<div className={b('buttons')}>
					<Button size="small" text="Ok" onClick={this._accept} />
				</div>
			</div>
		);
	}
}

export default View;
