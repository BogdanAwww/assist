import './portfolio-project-card.css';

import * as React from 'react';
import classname from '@/common/core/classname';
import Card from '@/common/views/card/card';
import Proportion from '@/common/views/proportion/proportion';
import {getVideoThumbnail, parsePortfolioLink} from '@/web/utils/project-utils';
import SvgIcon from '@/common/views/svg-icon/svg-icon';
import {DocumentUpload} from '@/common/types/upload';

import playIcon from '@/common/icons/play.svg';
import paperIcon from '@/common/icons/paper.svg';
import soundIcon from '@/common/icons/sound.svg';
import linkIcon from '@/common/icons/link.svg';

interface Props {
	title: string;
	specialty?: string;
	views?: number;
	link?: string;
	thumbnail?: string;
	attachment?: DocumentUpload;

	style?: React.CSSProperties;

	onClick?: () => void;
}

interface State {
	thumbnailUrl?: string;
}

const ICON_TYPES = {
	sound: soundIcon,
	paper: paperIcon,
	play: playIcon,
	external: linkIcon
} as const;

const b = classname('portfolio-project-card');

class PortfolioProjectCard extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {};
	}

	componentDidMount() {
		const props = this.props;
		const link = props.link;
		if (link && !props.thumbnail) {
			getVideoThumbnail(link).then((thumbnailUrl) => {
				this.setState({thumbnailUrl});
			});
		}
	}

	private _renderThumbnail = (): React.ReactNode => {
		const props = this.props;
		const attachment = props.attachment;
		const thumbnailUrl = attachment?.isImage ? attachment.url : props.thumbnail || this.state.thumbnailUrl;
		const data = parsePortfolioLink(props.link);
		const type =
			data?.name === 'soundcloud'
				? 'sound'
				: data?.type === 'external'
				? 'external'
				: !thumbnailUrl
				? 'paper'
				: 'play';
		const icon = data?.icon?.url || (attachment?.isImage ? undefined : ICON_TYPES[type]);
		const iconSize = data?.icon?.size || (type === 'play' ? 48 : type === 'external' ? 16 : 32);
		const backgroundImage = !data?.icon?.url && thumbnailUrl ? `url("${thumbnailUrl}")` : undefined;
		return (
			<div
				className={b('thumbnail', {
					icon: type !== 'play',
					image: Boolean(backgroundImage)
				})}
				style={{backgroundImage}}
			>
				{icon ? (
					<div className={b('overlay')}>
						<SvgIcon
							url={icon}
							width={data?.icon?.width || iconSize}
							height={data?.icon?.height || iconSize}
							key={type}
							noFill={Boolean(data?.icon)}
						/>
					</div>
				) : null}
			</div>
		);
	};

	render(): React.ReactNode {
		const props = this.props;
		return (
			<Card
				size="none"
				view="light"
				rounded
				shadow
				onClick={props.onClick}
				style={props.style}
				hoverScale={Boolean(props.onClick)}
			>
				<Proportion h={3} w={4}>
					<div className={b({clickable: Boolean(props.onClick)})}>
						{this._renderThumbnail()}
						<div className={b('footer')}>
							<div className={b('title')}>{props.title}</div>
							<div className={b('lowline')}>
								<div className={b('specialty')}>{props.specialty}</div>
								{typeof props.views === 'number' ? (
									<div className={b('views')}>{props.views}</div>
								) : null}
							</div>
						</div>
					</div>
				</Proportion>
			</Card>
		);
	}
}

export default PortfolioProjectCard;
