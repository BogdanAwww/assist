import './portfolio-project-preview.css';

import * as React from 'react';
import * as ReactRedux from 'react-redux';
import classname from '@/common/core/classname';
import AnimationWrapper from '@/common/views/animation-wrapper/animation-wrapper';
import {Participant, PortfolioProject} from '@/common/types/portfolio-project';
import {RouteComponentProps, withRouter} from 'react-router';
import Portal from '@/common/views/portal/portal';
import Proportion from '@/common/views/proportion/proportion';
import Avatar from '@/common/views/avatar/avatar';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import {getVideoThumbnail, parsePortfolioLink} from '@/web/utils/project-utils';
import {Viewer} from '@/common/types/user';
import composeConnect from '@/common/core/compose/compose';
import AppState from '@/web/state/app-state';
import Button from '@/common/views/button/button';
import {deletePortfolioProject, viewPortfolioProject} from '@/web/actions/data-provider';
import Hint from '@/common/views/hint/hint';
import Dialog from '@/common/views/dialog/dialog';
import PageTitle from '../page-title/page-title';
import DropboxEmbed from '@/common/views/dropbox-embed/dropbox-embed';
import appActions from '@/web/actions/app-actions';
import {i18nConnect, I18nProps} from '@/common/views/translates-provider/translates-provider';

import closeIcon from '@/common/icons/close.svg';
import angleLeftIcon from '@/common/icons/angle-left.svg';
import paperIcon from '@/common/icons/paper.svg';
import editIcon from '@/common/icons/edit.svg';
import deleteIcon from '@/common/icons/delete.svg';

const mapDispatchToProps = {
	loadViewer: appActions.loadViewer
};

interface StateToProps {
	viewer?: Viewer;
}

type ReduxProps = StateToProps & typeof mapDispatchToProps;

interface ChildrenProps {
	showPreview: (subject: number | PortfolioProject) => void;
}

interface SelfProps {
	projects?: PortfolioProject[];
	load?: () => void;
	single?: boolean;
	children: (props: ChildrenProps) => React.ReactNode;
	hideControls?: boolean;
	onRemove?: () => void;
}

type Props = SelfProps & ReduxProps & RouteComponentProps & I18nProps;

interface State {
	isOpen: boolean;
	index: number;
	project?: PortfolioProject;
	thumbnailUrl?: string;
	showRemoveDialog?: boolean;
}

const connect = composeConnect<SelfProps, ReduxProps, RouteComponentProps, I18nProps>(
	ReactRedux.connect((state: AppState): StateToProps => ({viewer: state.viewer}), mapDispatchToProps),
	withRouter,
	i18nConnect
);

const b = classname('portfolio-project-preview');

class PortfolioProjectPreview extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			isOpen: false,
			index: 0
		};
	}

	componentDidUpdate(_props: Props, state: State) {
		if ((!state.isOpen && this.state.isOpen) || this.state.index !== state.index) {
			this._sendView();
		}
	}

	private _showPreview = (subject: number | PortfolioProject): void => {
		const props = this.props;
		const projects = props.projects || [];
		const index = typeof subject === 'number' ? subject : projects.indexOf(subject);
		const project = projects[index] || subject;
		this.setState(
			{
				isOpen: true,
				index,
				project,
				thumbnailUrl: undefined
			},
			this._loadThumbnail
		);
	};

	private _sendView = (): void => {
		const project = this.state.project;
		const viewer = this.props.viewer;
		if (project && project._id && viewer?.username !== project.author.username) {
			viewPortfolioProject({id: project._id});
		}
	};

	private _loadThumbnail = (): void => {
		const thumbnailUrl = this.state.project?.link;
		if (thumbnailUrl) {
			getVideoThumbnail(thumbnailUrl).then((thumbnailUrl) => {
				this.setState({thumbnailUrl});
			});
		}
	};

	private _close = (): void => {
		this.setState({
			isOpen: false
		});
	};

	private _onPrevClick = (): void => {
		const index = this.state.index - 1;
		const projects = this.props.projects || [];
		const project = projects[index];
		this.setState(
			{
				index,
				project,
				thumbnailUrl: undefined
			},
			this._loadThumbnail
		);
	};

	private _onNextClick = (): void => {
		const index = this.state.index + 1;
		const projects = this.props.projects || [];
		const project = projects[index];
		this.setState(
			{
				index,
				project,
				thumbnailUrl: undefined
			},
			this._loadThumbnail
		);
	};

	private _openUrl = (): void => {
		const project = this.state.project;
		const url = project?.attachment?.url || project?.link;
		if (!url) {
			return;
		}
		window.open(url);
	};

	private _remove = (): void => {
		const project = this.state.project;
		if (!project || !project._id) {
			return;
		}
		deletePortfolioProject({id: project._id})
			.then(() => {
				this.props.onRemove?.();
				this.props.loadViewer();
			})
			.finally(() => {
				this.setState({showRemoveDialog: false, isOpen: false});
			});
	};

	private _renderControls = (): React.ReactNode => {
		const props = this.props;
		const t = props.translates;
		const project = this.state.project!;
		const author = project.author;
		if (props.viewer?.username !== author.username || props.hideControls) {
			return null;
		}
		return (
			<div className={b('controls')}>
				<Hint content={t.buttons.edit}>
					<Button
						size="small"
						icon={<SvgIcon url={editIcon} width={16} height={16} />}
						url={`/portfolio/${project._id}/edit`}
					/>
				</Hint>
				<Hint content={t.buttons.delete}>
					<Button
						size="small"
						icon={<SvgIcon url={deleteIcon} width={16} height={16} />}
						onClick={() => this.setState({showRemoveDialog: true})}
					/>
				</Hint>
			</div>
		);
	};

	private _renderHead = (): React.ReactNode => {
		const project = this.state.project!;
		const author = project.author;
		return (
			<div className={b('head')}>
				<Avatar user={author} size={64} />
				<div className={b('user')}>
					<div className={b('specialty')}>{project.specialty?.title}</div>
					<div className={b('name')}>
						<div>{author.localeFirstname}</div>
						<div>{author.localeLastname}</div>
					</div>
				</div>
				{this._renderControls()}
				<div className={b('close')} onClick={this._close}>
					<SvgIcon url={closeIcon} width={24} height={24} />
				</div>
			</div>
		);
	};

	private _renderIframe = (url: string, audio?: boolean): React.ReactNode => {
		const height = audio && url.includes('/sets/') ? '400px' : undefined;
		return (
			<iframe
				src={url}
				style={{height}}
				frameBorder="0"
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
			/>
		);
	};

	private _renderEmbed = (): React.ReactNode => {
		const state = this.state;
		const project = state.project!;
		const thumbnailUrl = state.thumbnailUrl;
		const data = parsePortfolioLink(project.link);
		if (data?.name === 'soundcloud') {
			return this._renderIframe(data.url, true);
		}
		if (data?.name === 'dropbox' && project.link) {
			return (
				<Proportion w={16} h={9}>
					<DropboxEmbed url={project.link} />
				</Proportion>
			);
		}
		const attachment = project.attachment;
		const backgroundImageUrl = attachment?.isImage ? attachment.url : thumbnailUrl;
		return (
			<Proportion w={16} h={9}>
				{data?.type === 'embed' ? (
					this._renderIframe(project.iframe || data.url)
				) : (
					<div
						className={b('thumbnail', {
							hoverable: Boolean(project.attachment?.url) || data?.type === 'external'
						})}
						style={{backgroundImage: backgroundImageUrl ? `url("${backgroundImageUrl}")` : undefined}}
						onClick={!thumbnailUrl || data?.type === 'external' ? this._openUrl : undefined}
					>
						{!backgroundImageUrl ? (
							<SvgIcon
								url={data?.icon?.url || paperIcon}
								width={data?.icon?.width || 64}
								height={data?.icon?.height || 64}
								noFill={Boolean(data?.icon)}
							/>
						) : null}
						{data?.type === 'external' ? (
							<div className={b('preview-link-text')}>
								{this.props.translates.dialogs.projectPreview.previewOnLink[0]}{' '}
								<a className={b('preview-link')} href={data.url} rel="nofollow,noindex">
									{this.props.translates.dialogs.projectPreview.previewOnLink[1]}
								</a>
								.
							</div>
						) : null}
					</div>
				)}
			</Proportion>
		);
	};

	private _renderPlayer = (): React.ReactNode => {
		const props = this.props;
		const state = this.state;
		const hasPrev = props.single ? false : state.index > 0;
		const hasNext = props.single ? false : state.index < (props.projects || []).length - 1;
		return (
			<div className={b('media')}>
				<div className={b('prev', {show: hasPrev})} onClick={this._onPrevClick}>
					<SvgIcon url={angleLeftIcon} width={24} height={24} />
				</div>
				{this._renderEmbed()}
				<div className={b('next', {show: hasNext})} onClick={this._onNextClick}>
					<SvgIcon url={angleLeftIcon} width={24} height={24} />
				</div>
			</div>
		);
	};

	private _renderParticipant = (participant: Participant, index: number): React.ReactNode => {
		const user = participant.user;
		const name = user ? user.localeFirstname : participant.name || '';
		return (
			<div className={b('participant')} key={index}>
				<Avatar user={user} size={48} />
				<div className={b('participant-info')}>
					<div className={b('participant-specialty')}>{participant.specialty?.title}</div>
					<div className={b('participant-name')}>
						<div>{name}</div>
						<div>{user?.lastName}</div>
					</div>
				</div>
			</div>
		);
	};

	private _renderParticipants = (): React.ReactNode => {
		const participants = this.state.project!.participants || [];
		if (participants.length === 0) {
			return null;
		}
		return (
			<div className={b('participants')}>
				<div className={b('with')}>{this.props.translates.dialogs.projectPreview.with}</div>
				<div className={b('participant-list')}>{participants.map(this._renderParticipant)}</div>
			</div>
		);
	};

	private _renderFooter = (): React.ReactNode => {
		const project = this.state.project!;

		return (
			<div className={b('footer')}>
				<div className={b('info')}>
					<div className={b('title')}>{project.localeTitle}</div>
					<div className={b('description')}>{project.localeDescription}</div>
					<div className={b('responsibilities')}>{project.localeResponsibilities}</div>
				</div>
				{this._renderParticipants()}
			</div>
		);
	};

	private _renderPreviewer = (): React.ReactNode => {
		const state = this.state;
		const project = state.project;
		if (!state.isOpen || !project) {
			return null;
		}
		return (
			<div className={b()}>
				<div className={b('content')}>
					{this._renderHead()}
					{this._renderPlayer()}
					{this._renderFooter()}
				</div>
			</div>
		);
	};

	private _renderRemoveDialog = (): React.ReactNode => {
		const t = this.props.translates;
		return (
			<Dialog
				isOpen={this.state.showRemoveDialog}
				onClose={() => this.setState({showRemoveDialog: false})}
				overlayClose
				showClose
			>
				<div className={b('dialog')}>
					<PageTitle>{t.deleteProjectQuestion}</PageTitle>
					<div className={b('dialog-buttons')}>
						<Button text={t.buttons.delete} onClick={this._remove} />
						<Button
							view="secondary"
							text={t.buttons.cancel}
							onClick={() => this.setState({showRemoveDialog: false})}
						/>
					</div>
				</div>
			</Dialog>
		);
	};

	render(): React.ReactNode {
		return (
			<>
				{this.props.children({
					showPreview: this._showPreview
				})}
				<Portal>
					<AnimationWrapper>{this._renderPreviewer()}</AnimationWrapper>
				</Portal>
				{this._renderRemoveDialog()}
			</>
		);
	}
}

export default connect(PortfolioProjectPreview);
