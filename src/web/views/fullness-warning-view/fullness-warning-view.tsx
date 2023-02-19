import './fullness-warning-view.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import Dialog from '@/common/views/dialog/dialog';
import {Viewer} from '@/common/types/user';
import AppState, {RoleType} from '@/web/state/app-state';
import Button from '@/common/views/button/button';
import PageTitle from '../page-title/page-title';
import {getFullnessScore} from '@/web/utils/user-utils';
import {TranslatesContext} from '@/common/views/translates-provider/translates-provider';

interface SelfProps {
	children?: (onClick?: () => void) => React.ReactNode;
	initialShow?: boolean;
}

interface StateToProps {
	viewer?: Viewer;
	role?: RoleType;
}

type Props = SelfProps & StateToProps;

interface State {
	showDialog?: boolean;
}

const b = classname('fullness-warning-view');

const connect = ReactRedux.connect(
	(state: AppState): StateToProps => ({
		viewer: state.viewer,
		role: state.role
	})
);

class View extends React.PureComponent<Props, State> {
	static contextType = TranslatesContext;
	constructor(props: Props) {
		super(props);

		const fullnessScore = props.viewer ? getFullnessScore(props.viewer, props.role) : 0;
		this.state = {
			showDialog: props.initialShow && fullnessScore < 1
		};
	}

	private _showDialog = (): void => {
		this.setState({showDialog: true});
	};

	render(): React.ReactNode {
		const props = this.props;
		const fullnessScore = props.viewer ? getFullnessScore(props.viewer, props.role) : 0;
		const isDemoViewer = props.viewer?.demo;
		const t = this.context.translates;
		return (
			<>
				{this.props.children?.(fullnessScore < 1 && !isDemoViewer ? this._showDialog : undefined)}
				<Dialog
					isOpen={this.state.showDialog}
					overlayClose={props.initialShow}
					showClose={props.initialShow}
					onClose={() => this.setState({showDialog: false})}
				>
					<div className={b('dialog')}>
						<PageTitle>{t.fullnessWarningDialog?.[0]}</PageTitle>
						{t.fullnessWarningDialog?.[1]} <b>{Math.floor(fullnessScore * 100)}%</b>.
						<div>{t.fullnessWarningDialog?.[2]}</div>
						<div className={b('buttons')}>
							<Button text={t.fullnessWarningDialog?.[3]} url="/settings" />
						</div>
					</div>
				</Dialog>
			</>
		);
	}
}

const FullnessWarning = connect(View);

export default FullnessWarning;
