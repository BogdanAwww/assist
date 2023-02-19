import './specialty-list.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import {getSpecialtyGroups} from '@/admin/actions/data-provider';
import {Specialty, SpecialtyGroup} from '@/common/types/specialty';
import PageTitle from '@/web/views/page-title/page-title';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import LinkWrapper from '@/common/views/link-wrapper/link-wrapper';
import {TranslatesContext} from '@/common/views/translates-provider/translates-provider';

import editIcon from '@/common/icons/edit.svg';
import Button from '@/common/views/button/button';

interface Props {}

interface State {
	specialtyGroups?: SpecialtyGroup[];
}

const b = classname('specialty-list-page');

class SpecialtyListPage extends React.PureComponent<Props, State> {
	static contextType = TranslatesContext;
	constructor(props: Props) {
		super(props);

		this.state = {};
	}

	componentDidMount() {
		getSpecialtyGroups().then((specialtyGroups) => {
			this.setState({specialtyGroups});
		});
	}

	private _renderSpecialty = (specialty: Specialty): React.ReactNode => {
		const lang = this.context.lang;
		return (
			<LinkWrapper className={b('specialty')} key={specialty._id} url={`/panel/specialty/${specialty._id}/edit`}>
				<div className={b('specialty-title')}>{specialty.titles![lang] || specialty.title}</div>
			</LinkWrapper>
		);
	};

	private _renderGroup = (group: SpecialtyGroup): React.ReactNode => {
		const specialties = group.specialties || [];
		return (
			<div className={b('group')} key={group._id}>
				<div className={b('group-title')}>
					{group.title}
					<LinkWrapper className={b('group-edit')} url={`/panel/specialty/group/${group._id}`}>
						<SvgIcon url={editIcon} width={16} height={16} />
					</LinkWrapper>
				</div>
				<div className={b('specialties')}>{specialties.map(this._renderSpecialty)}</div>
			</div>
		);
	};

	render(): React.ReactNode {
		const groups = this.state.specialtyGroups || [];
		return (
			<div className={b()}>
				<div className={b('add')}>
					<div>
						<PageTitle>Специальности</PageTitle>
						<Button url="/panel/specialty/add" text="Добавить" />
					</div>
					<div>
						<PageTitle>Группы</PageTitle>
						<Button url="/panel/specialty/add-group" text="Добавить" />
					</div>
				</div>
				{groups.map(this._renderGroup)}
			</div>
		);
	}
}

export default SpecialtyListPage;
