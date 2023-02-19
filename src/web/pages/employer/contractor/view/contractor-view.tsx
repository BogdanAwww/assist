import './contractor-view.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import FixedSideView from '@/web/views/fixed-side-view/fixed-side-view';
import ContractorView from '@/web/views/contractor-view/contractor-view';
import {GetPortfolioFilter, getPortfolioProjects, getUser} from '@/web/actions/data-provider';
import {RouteComponentProps, withRouter} from 'react-router-dom';
import {User} from '@/common/types/user';
import {PortfolioProject} from '@/common/types/portfolio-project';
import SizedItemsList from '@/common/views/sized-items-list/sized-items-list';
import PortfolioProjectCard from '@/web/views/portfolio-project-card/portfolio-project-card';
import PortfolioProjectPreview from '@/web/views/portfolio-project-preview/portfolio-project-preview';
import Button from '@/common/views/button/button';
import PageTitle from '@/web/views/page-title/page-title';
import CountFilters, {CountItem} from '@/web/views/count-filters/count-filters';
import {isEqual} from 'lodash-es';
import ConditionalRender from '@/common/views/conditional-render/conditional-render';
import AppState from '@/web/state/app-state';
import {TranslatesContext} from '@/common/views/translates-provider/translates-provider';

interface SelfProps {}

type Props = SelfProps & RouteComponentProps<{username: string}>;

interface State {
	user?: User;
	projects: PortfolioProject[];
	filter?: GetPortfolioFilter;
}

const b = classname('contractor-view-page');

class ContractorViewPage extends React.PureComponent<Props, State> {
	static contextType = TranslatesContext;

	constructor(props: Props) {
		super(props);

		this.state = {
			projects: []
		};
	}

	componentDidMount() {
		this._load();
	}

	componentDidUpdate(_props: Props, state: State) {
		if (!isEqual(state.filter, this.state.filter)) {
			this._loadPortfolio();
		}
	}

	private _load = (): void => {
		const username = this.props.match.params.username;
		getUser({username}).then((user) => {
			this.setState({user}, this._loadPortfolio);
		});
	};

	private _loadPortfolio = (): void => {
		const state = this.state;
		const user = state.user;
		if (user) {
			getPortfolioProjects(state.filter || {author: user._id}).then((projects) => {
				this.setState({projects});
			});
		}
	};

	private _renderSide = (): React.ReactNode => {
		const props = this.props;
		const user = this.state.user;
		const t = this.context.translates;
		if (!user) {
			return null;
		}
		return (
			<div className={b('side')}>
				<ContractorView user={user} />
				<div className={b('buttons')}>
					{props.history.length > 1 ? (
						<ConditionalRender if={(state) => Boolean(state.viewer)}>
							<Button view="invisible" text={t['back']} onClick={props.history.goBack} />
						</ConditionalRender>
					) : null}
				</div>
			</div>
		);
	};

	private _renderList = (): React.ReactNode => {
		const state = this.state;
		const projects = state.projects;
		const user = state.user;
		const lang = this.context.lang;
		const t = this.context.translates;
		if (!user) {
			return null;
		}
		const userSpecialtyOptions: CountItem[] =
			user.specialties?.map((specialty) => ({
				title: specialty.titles![lang] || specialty.title,
				value: specialty._id
			})) || [];
		const items: CountItem[] = [{title: t.allWorks, value: 'total'}].concat(userSpecialtyOptions);
		return (
			<div className={b('list')}>
				<div className={b('list-head')}>
					<PageTitle noMargin>{t['portfolio']}</PageTitle>
					<div className={b('filters')}>
						<CountFilters
							value={state.filter?.specialty}
							defaultValue="total"
							items={items}
							onChange={(specialty) =>
								this.setState({
									filter: {author: user._id, specialty: specialty === 'total' ? undefined : specialty}
								})
							}
							compact
						/>
					</div>
				</div>
				<PortfolioProjectPreview projects={projects}>
					{({showPreview}) => (
						<SizedItemsList gutter={16}>
							{projects.map((project, index) => (
								<PortfolioProjectCard
									title={project.title}
									specialty={project.specialty?.title}
									views={project.views}
									link={project.link}
									thumbnail={project.thumbnail}
									attachment={project.attachment}
									onClick={() => showPreview(index)}
									key={project._id}
								/>
							))}
						</SizedItemsList>
					)}
				</PortfolioProjectPreview>
				{projects.length === 0 ? <div className={b('empty')}>{this.context.translates.empty}</div> : null}
			</div>
		);
	};

	private _renderView = (noMargin: boolean) => {
		return (
			<FixedSideView side={this._renderSide()} noMargin={noMargin}>
				{this._renderList()}
			</FixedSideView>
		);
	};

	render(): React.ReactNode {
		return (
			<div className={b()}>
				<ConditionalRender if={isNotLogged} else={this._renderView(false)} children={this._renderView(true)} />
			</div>
		);
	}
}

function isNotLogged(state: AppState) {
	return !state.viewer;
}

export default withRouter(ContractorViewPage);
