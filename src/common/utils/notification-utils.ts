import {v4 as uuidv4} from 'uuid';

function getId(): string {
	return uuidv4();
}

export {getId};
