import './panel.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import UserPage from '@/common/views/user-page/user-page';
import Card from '@/common/views/card/card';
import Button from '@/common/views/button/button';
import {Route} from 'react-router-dom';
import routes from './panel-routes';

const b = classname('panel-page');

class ProjectPage extends React.PureComponent {
	private _renderLeftSide = (): React.ReactNode => {
		return (
			<div className={b('left')}>
				<Card className={b('panel')} view="dark" rounded>
					<Button
						view="bordered-white"
						size="medium"
						stretched
						text="Специальности"
						url="/panel/specialty/list"
					/>
					<Button view="bordered-white" size="medium" stretched text="Пользователи" url="/panel/users" />
					<Button view="bordered-white" size="medium" stretched text="Проекты" url="/panel/projects" />
					<Button view="bordered-white" size="medium" stretched text="Оплаты" url="/panel/payments" />
					<Button view="bordered-white" size="medium" stretched text="Мониторинг" url="/panel/monitorings" />
				</Card>
			</div>
		);
	};

	private _renderRightSide = (): React.ReactNode => {
		return (
			<div className={b('right')}>
				{routes.map((routeProps, index) => (
					<Route {...routeProps} key={index} />
				))}
			</div>
		);
	};

	render(): React.ReactNode {
		return <UserPage left={this._renderLeftSide()} right={this._renderRightSide()} />;
	}
}

export default ProjectPage;
