import * as React from 'react';
import * as ReactRedux from 'react-redux';
import AppState from '@/web/state/app-state';
import {ProjectType} from '@/common/types/project';

interface SelfProps {
	id: string;
}

interface StateToProps {
	projectTypes: ProjectType[];
}

type Props = SelfProps & StateToProps;

const connect = ReactRedux.connect((state: AppState): StateToProps => {
	return {
		projectTypes: state.projectTypes || []
	};
});

class ProjectTypeTitle extends React.PureComponent<Props> {
	render(): React.ReactNode {
		const props = this.props;
		const type = props.projectTypes.find((type) => type.id === props.id);
		return type?.title || null;
	}
}

export default connect(ProjectTypeTitle);
