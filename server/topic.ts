import {PointsInterface, Points} from './points';

export interface TopicInterface {
	topic: String;
	isActive: Boolean;
	participants: PointsInterface[];
}


export class Topic implements TopicInterface {
	topic: String;
	isActive: Boolean;
	participants: Points[]
}

