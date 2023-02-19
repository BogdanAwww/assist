import './specialties-sidebar.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import Sidebar from '@/common/views/sidebar/sidebar';
import classname from '@/common/core/classname';
import {Specialty, SpecialtyGroup} from '@/common/types/specialty';
import AppState from '@/web/state/app-state';
import appActions from '@/web/actions/app-actions';
import Badge from '@/common/views/badge/badge';
import FuseSearch from '@/common/views/fuse-search/fuse-search';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';

import closeIcon from '@/common/icons/close.svg';

const mapDispathToProps = {
	loadSpecialtyGroups: appActions.loadSpecialtyGroups
};

interface ChildrenProps {
	openSidebar: () => void;
}

interface StateToProps {
	groups: SpecialtyGroup[];
}

interface SelfProps {
	selected: string[];
	children: (props: ChildrenProps) => React.ReactNode;
	onChange: (specialties: string[]) => void;
	limit?: number;
	single?: boolean;
}

type Props = SelfProps & StateToProps & typeof mapDispathToProps & I18nProps;

interface State {
	isOpen: boolean;
}

const connect = ReactRedux.connect((state: AppState) => ({groups: state.specialtyGroups || []}), mapDispathToProps);

const b = classname('specialties-sidebar');

const DEFAULT_LIMIT = 6;

class SpecialtiesSidebar extends React.Component<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			isOpen: false
		};
	}

	componentDidMount() {
		this.props.loadSpecialtyGroups();
	}

	private _open = (): void => {
		this.setState({isOpen: true});
	};

	private _close = (): void => {
		this.setState({isOpen: false});
	};

	private _toggleSpecialty = (id: string) => {
		const props = this.props;
		const selected = props.selected;
		const modified = props.single
			? [id]
			: selected.includes(id)
			? selected.filter((specialtyId) => specialtyId !== id)
			: selected.concat([id]);
		props.onChange(modified.slice(0, props.single ? 1 : props.limit || DEFAULT_LIMIT));
	};

	private _getSpecialties = (): Specialty[] => {
		return this.props.groups.reduce((acc, group) => [...acc, ...(group.specialties || [])], []);
	};

	private _filterGroups = (value: string, items: Specialty[]): SpecialtyGroup[] => {
		const groups = this.props.groups;
		const map = items.reduce((acc, item) => ({...acc, [item._id]: item}), {});
		const filtered = groups.reduce((acc, group) => {
			const specialties = (group.specialties || []).filter((item) => map[item._id]);
			if (specialties.length > 0) {
				acc.push({
					...group,
					specialties
				});
			}
			return acc;
		}, [] as SpecialtyGroup[]);
		return !value ? groups : filtered;
	};

	private _renderGroup = (group: SpecialtyGroup): React.ReactNode => {
		const specialties = group.specialties || [];
		return (
			<div className={b('group')} key={group._id}>
				<div className={b('group-title')}>{group.title}</div>
				<div className={b('specialties')}>{specialties.map(this._renderSpecialty)}</div>
			</div>
		);
	};

	private _renderSpecialty = (specialty: Specialty): React.ReactNode => {
		const isSelected = this.props.selected.includes(specialty._id);
		const lang = this.props.lang;
		return (
			<div className={b('specialty')} key={specialty._id}>
				<Badge
					title={specialty.titles![lang] || specialty.title}
					view="white"
					selected={isSelected}
					onClick={() => this._toggleSpecialty(specialty._id)}
				/>
			</div>
		);
	};

	private _renderSidebar = (): React.ReactNode => {
		const props = this.props;
		const specialties = this._getSpecialties();
		const t = props.translates;
		return (
			<Sidebar isOpen={this.state.isOpen} onClose={this._close}>
				<div className={b('header')}>
					<div className={b('left')}>
						<div className={b('title')}>{t.sidebar.specialties.all}</div>
						{!props.single && (props.limit || DEFAULT_LIMIT > 1) ? (
							<div className={b('disclaimer')}>
								{t.sidebar.specialties.maximum.replace('%d', (props.limit || DEFAULT_LIMIT).toString())}
							</div>
						) : null}
					</div>
					<div className={b('right')}>
						<div className={b('close')} onClick={this._close}>
							<SvgIcon url={closeIcon} width={24} height={24} />
						</div>
					</div>
				</div>
				<FuseSearch className={b('search')} placeholder={t.quickSearch} keys={['title']} options={specialties}>
					{({value, items}) => (
						<>
							<div className={b('groups')}>{this._filterGroups(value, items).map(this._renderGroup)}</div>
							{this._filterGroups(value, items).length === 0 ? (
								<div className={b('empty')}>{t.sidebar.specialties.notFound}</div>
							) : null}
						</>
					)}
				</FuseSearch>
			</Sidebar>
		);
	};

	render(): React.ReactNode {
		return (
			<>
				{this.props.children({openSidebar: this._open})}
				{this._renderSidebar()}
			</>
		);
	}
}

export default connect(i18nConnect(SpecialtiesSidebar));
