import {composeWithMongoose} from 'graphql-compose-mongoose';
import mongoose, {Schema} from 'mongoose';
import {getRelationProjectById} from '@/server/schema/relations/project';
import {getRelationUserById} from '@/server/schema/relations/user';
import generator from 'password-generator';

const schema = new Schema({
	hash: {type: String, default: () => generator(16, false)},
	project: {type: Schema.Types.ObjectId, ref: 'Project'},
	author: {type: Schema.Types.ObjectId, ref: 'User'},
	contractor: {type: Schema.Types.ObjectId, ref: 'User'},
	status: {type: String, enum: ['active', 'accepted', 'rejected'], default: 'active'}
});

export const ProjectInviteModel = mongoose.model('ProjectInvite', schema);
export const ProjectInviteTC = composeWithMongoose(ProjectInviteModel);

ProjectInviteTC.addFields({
	project: () => getRelationProjectById('project'),
	author: () => getRelationUserById('author'),
	contractor: () => getRelationUserById('contractor')
});
