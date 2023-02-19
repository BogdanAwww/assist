import './favorites.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import SizedItemsList from '@/common/views/sized-items-list/sized-items-list';
import {getFavorites} from '@/web/actions/data-provider';
import {Favorite} from '@/common/types/favorite';
import {PaginationOutput} from '@/common/types';
import ContractorCard from '@/web/views/contractor-card/contractor-card';
import CountFilters, {CountItem} from '@/web/views/count-filters/count-filters';
import ContractorProjectCard from '@/web/views/contractor-project-card/contractor-project-card';
import {TranslatesContext} from '@/common/views/translates-provider/translates-provider';

interface Props {}

interface State {
	type: string;
	data?: PaginationOutput<Favorite, {User: number; Project: number}>;
}

const b = classname('favorites-page');

class FavoritesPage extends React.PureComponent<Props, State> {
	static contextType = TranslatesContext;

	constructor(props: Props) {
		super(props);

		this.state = {
			type: 'User'
		};
	}

	componentDidMount() {
		this._load();
	}

	componentDidUpdate(_props: Props, state: State) {
		if (state.type !== this.state.type) {
			this._load();
		}
	}

	private _load = (page?: number): void => {
		getFavorites({type: this.state.type, page}).then((data) => {
			this.setState({data});
		});
	};

	private _renderItem = (item: Favorite): React.ReactNode => {
		if (item.type === 'User') {
			return <ContractorCard user={item.subject} openPage key={item._id} />;
		}
		return <ContractorProjectCard project={item.subject} openPage key={item._id} />;
	};

	render(): React.ReactNode {
		const t = this.context.translates;
		const state = this.state;
		const data = state.data;
		const items = data?.items || [];
		const COUNT_ARCHIVE_FILTERS: Omit<CountItem, 'count'>[] = [
			{
				value: 'User',
				title: t['users']
			},
			{
				value: 'Project',
				title: t['projects']
			}
		];

		const filterItems = COUNT_ARCHIVE_FILTERS.map((item) => ({...item, count: data?.count?.[item.value]}));
		return (
			<div className={b()}>
				<CountFilters value={state.type} items={filterItems} onChange={(type) => this.setState({type})} />
				<div className={b('list')}>
					<SizedItemsList
						gutter={16}
						pageInfo={data?.pageInfo}
						onPageChange={(page) => this._load(page)}
						emptyMessage={t['favoritesFishText']}
					>
						{items.map(this._renderItem)}
					</SizedItemsList>
				</div>
			</div>
		);
	}
}

export default FavoritesPage;
