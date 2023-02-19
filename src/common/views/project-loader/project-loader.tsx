import * as React from 'react';
import {getProject} from '@/web/actions/data-provider';
import {Project} from '@/common/types/project';

interface Props {
	id: string;
	onChange?: (project?: Project) => void;
}

class ProjectLoader extends React.PureComponent<Props> {
	componentDidMount() {
		const props = this.props;
		getProject(props.id).then((project) => {
			props.onChange?.(project);
		});
	}

	render(): React.ReactNode {
		return null;
	}
}

export default ProjectLoader;
