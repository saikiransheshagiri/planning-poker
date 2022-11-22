const _ = require('lodash');
import {Room, RoomInterface} from './room';

export interface PlanningInterface {
	rooms: RoomInterface[];
	addRoom(room: RoomInterface);
	getRooms();
	deleteRoom(room: RoomInterface);
	roomExists(roomName: String);
	getRoom(roomName: String);
}


export class Planning implements PlanningInterface {
	rooms: Room[];

	constructor(){
		this.rooms = new Array<Room>();
	}

	addRoom(room: Room) {
		this.rooms.push(room);
	}

	getRooms() {
		return this.rooms;
	}

	getRoom(roomName: String) {
		return _.find(this.rooms, { 'name': roomName} );
	}

	roomExists(roomName: String) {
		return _.some(this.rooms, { 'name': roomName} );
	}

	deleteRoom(room: Room) {
		_.remove(this.rooms, { 'name': room.name});
	}
}


//bootstrap planning
export var PLANNING_APP:PlanningInterface = new Planning();
