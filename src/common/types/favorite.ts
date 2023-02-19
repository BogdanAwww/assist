import {Project} from './project';
import {User} from './user';

interface BaseFavorite {
	_id: string;
	ts: number;
}

interface UserFavorite extends BaseFavorite {
	type: 'User';
	subject: User;
}

interface ProjectFavorite extends BaseFavorite {
	type: 'Project';
	subject: Project;
}

type Favorite = UserFavorite | ProjectFavorite;

export {Favorite};
