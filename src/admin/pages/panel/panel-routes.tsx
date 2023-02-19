import {RouteProps} from 'react-router-dom';

import SpecialtyListPage from './specialty/list/specialty-list';
import SpecialtyGroupPage from './specialty/group/specialty-group';
import SpecialtyEditPage from './specialty/edit/specialty-edit';
import UsersListPage from './users/list/users-list';
import MonitoringsPage from './monitorings/monitorings';
import PaymentsPage from './payments/payments';
import UserViewPage from './users/view/user-view';
import ProjectsListPage from './projects/list/projects-list';
import ProjectViewPage from './projects/view/project-view';

const routes: RouteProps[] = [
	{
		path: '/panel/specialty/list',
		exact: true,
		component: SpecialtyListPage
	},
	{
		path: '/panel/specialty/add',
		exact: true,
		component: SpecialtyEditPage
	},
	{
		path: '/panel/specialty/add-group',
		exact: true,
		component: SpecialtyGroupPage
	},
	{
		path: '/panel/specialty/:id/edit',
		component: SpecialtyEditPage
	},
	{
		path: '/panel/specialty/group/:id',
		component: SpecialtyGroupPage
	},
	{
		path: '/panel/users',
		component: UsersListPage
	},
	{
		path: '/panel/user/:username',
		component: UserViewPage
	},
	{
		path: '/panel/projects',
		component: ProjectsListPage
	},
	{
		path: '/panel/project/:id',
		component: ProjectViewPage
	},
	{
		path: '/panel/monitorings',
		component: MonitoringsPage
	},
	{
		path: '/panel/payments',
		component: PaymentsPage
	}
];

export default routes;
