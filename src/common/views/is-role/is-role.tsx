import * as React from 'react';
import AppState, {RoleType} from '@/web/state/app-state';
import ConditionalRender from '../conditional-render/conditional-render';

interface Props {
	equal: RoleType;
	else?: React.ReactNode;
}

class IsRole extends React.PureComponent<Props> {
	private _check = (state: AppState): boolean => state.role === this.props.equal;

	render(): React.ReactNode {
		const props = this.props;
		return (
			<ConditionalRender if={this._check} else={props.else}>
				{props.children}
			</ConditionalRender>
		);
	}
}

export default IsRole;
