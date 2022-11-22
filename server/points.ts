import {UserInterface, User} from './user';

export interface PointsInterface {
	points: Number;
	user: UserInterface;
}


export class Points implements PointsInterface {
	points: Number;
	user: User;
}
