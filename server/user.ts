export interface UserInterface {
	name: String;
	isHost: Boolean;
	isChicken: Boolean;
}

export class User implements UserInterface {
	name: String;
	isHost: Boolean;
	isChicken: Boolean;
}
