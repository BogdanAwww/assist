import './projects-list.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import {getProjects} from '@/admin/actions/data-provider';
import notificationActions from '@/web/actions/notification-actions';
import {PaginationOutput} from '@/common/types';
import ItemsList from '@/common/views/items-list/items-list';
import composeConnect from '@/common/core/compose/compose';
import {withRouter, RouteComponentProps} from 'react-router';
import {Project} from '@/common/types/project';
import {getEstimate} from '@/web/utils/date-utils';
import Button from '@/common/views/button/button';

const mapDispatchToProps = {
	showNotification: notificationActions.showNotification
};

interface SelfProps {}

type ReduxProps = typeof mapDispatchToProps;

type Props = SelfProps & ReduxProps & RouteComponentProps;

interface State {
	status: string;
	migrating?: boolean;
	data?: PaginationOutput<Project>;
}

const connect = composeConnect<SelfProps, ReduxProps, RouteComponentProps>(
	ReactRedux.connect(null, mapDispatchToProps),
	withRouter
);

const b = classname('projects-list-page');

class ProjectListPage extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			status: 'active'
		};
	}

	private _load = (page?: number): void => {
		getProjects({filter: {status: this.state.status}, page, perPage: 10}).then((data) => {
			this.setState({data});
		});
	};

	private _toggleStatus = (): void => {
		const status = this.state.status;
		this.setState({status: status === 'active' ? 'archived' : 'active'}, this._load);
	};

	private _renderLine = (project: Project): React.ReactNode => {
		return (
			<div
				className={b('project')}
				key={project._id}
				onClick={() => this.props.history.push(`/panel/project/${project._id}`)}
			>
				<div className={b('info')}>
					<div>{project.title}</div>
					<div className={b('created')}>{new Date(project.createdAt || 0).toLocaleDateString()}</div>
				</div>
				<div
					className={b('user')}
					onClick={(e) => {
						e.stopPropagation();
						this.props.history.push(`/panel/user/${project.author.username}`);
					}}
				>
					{project.author.fullName} ({project.author.username})
				</div>
				<div className={b('est')}>
					{getEstimate(project.applicationEst) ||
						(project.endDate && `Окончен ${new Date(project.endDate || 0).toLocaleDateString()}`)}
				</div>
			</div>
		);
	};

	private _renderList = (): React.ReactNode => {
		return (
			<div className={b('list')}>
				<div className={b('project', {head: true})}>
					<div className={b('info')}>Проект / создан</div>
					<div className={b('user')}>Автор</div>
					<div className={b('est')}>Прием заявок</div>
				</div>
				<ItemsList data={this.state.data} loadPage={this._load}>
					{this._renderLine}
				</ItemsList>
			</div>
		);
	};

	render(): React.ReactNode {
		const state = this.state;
		const total = state.data?.count || 0;
		return (
			<div className={b()}>
				<div className={b('head')}>
					<div>Всего: {total}</div>
					<Button
						text={state.status === 'active' ? 'Архивные проекты' : 'Активные проекты'}
						onClick={this._toggleStatus}
					/>
				</div>
				{this._renderList()}
			</div>
		);
	}
}

export default connect(ProjectListPage);
