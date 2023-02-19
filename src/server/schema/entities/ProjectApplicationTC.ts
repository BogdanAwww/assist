import {composeWithMongoose} from 'graphql-compose-mongoose';
import mongoose, {Schema} from 'mongoose';
import {getRelationProjectById} from '@/server/schema/relations/project';
import {getRelationUserById} from '@/server/schema/relations/user';

const schema = new Schema({
	author: {type: Schema.Types.ObjectId, ref: 'User'},
	project: {type: Schema.Types.ObjectId, ref: 'Project'},
	description: String,
	links: [String],
	budget: Number,
	shiftCost: Number,
	showTest: Boolean,
	isUnread: {type: Boolean, default: () => true},
	status: {type: String, enum: ['active', 'accepted', 'rejected', 'invited'], default: 'active'}
});

schema.set('timestamps', true);

export const ProjectApplicationModel = mongoose.model('ProjectApplication', schema);
export const ProjectApplicationTC = composeWithMongoose(ProjectApplicationModel);

ProjectApplicationTC.addFields({
	author: () => getRelationUserById('author'),
	project: () => getRelationProjectById('project')
});
