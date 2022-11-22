
import {ResponseMessageInterface, ResponseMessage} from './common';
import * as appConstants from './constants';

import {Room} from './room';
import {User} from './user';
import {Topic} from './topic';
import {Points} from './points';


import {PLANNING_APP} from  './planning';
const _ = require('lodash');

export function getRooms() {
	return PLANNING_APP.rooms;
}

export function addRoom(roomName: String, accessCode: String): ResponseMessage {
	
	let room = new Room(roomName, accessCode);
	let response = new ResponseMessage();

	if(PLANNING_APP.roomExists(room.name)) {
		response.message = appConstants.ROOM_EXISTS;
	} else {
		PLANNING_APP.addRoom(room);
		response.message = appConstants.ROOM_ADDED
	}

	response.content = PLANNING_APP.getRooms();
	
	return response;
}

export function deleteRoom(roomName: String): ResponseMessage {
	let response = new ResponseMessage();

	if(PLANNING_APP.roomExists(roomName)) {
		let room = PLANNING_APP.getRoom(roomName);
		PLANNING_APP.deleteRoom(room);

		response.message = appConstants.ROOM_DELETED;
	} else {
		response.message = appConstants.ROOM_INVALID;
	}

	response.content = PLANNING_APP.getRooms();

	return response;
}

export function addUser(user: User, room: Room): ResponseMessage {
	let response = new ResponseMessage();

	room.users.push(user);

	response.message = appConstants.USER_ADDED;
	response.content = {
		user: user,
		room: room
	};

	return response;
}

export function removeUser(user: User, room: Room):ResponseMessage {
	let response = new ResponseMessage();

	let cTopic = room.topicInProgress();
	if(typeof cTopic !== 'undefined' && !user.isHost && !user.isChicken) {
		_.remove(cTopic.participants, {'user': user});
	}

	room.removeUser(user);
	response.message = appConstants.USER_REMOVED;	
	response.content = room;

	return response;
}

export function getUsers(room: Room):ResponseMessage {
	let response = new ResponseMessage();

	response.message = appConstants.SUCCESS;
	response.content = room.users;

	return response;
}

export function addTopic(room: Room, topic: Topic):ResponseMessage {
	let response = new ResponseMessage();

	let participants = _.filter(room.users, { 'isHost': false, 'isChicken': false });

	//set all topics to inactive
	_.forEach(room.topics, function(t) {
		t.isActive = false;
	});

	topic.participants = _.map(participants, function(participant) {
		let userPoints: Points = new Points();
		userPoints.points = 0;
		userPoints.user = participant;
		return userPoints;
	});

	room.topics.push(topic);
	response.message = appConstants.SUCCESS;
	response.content = room;
	

	return response;
}

export function updateTopic(room: Room, user: User) {
	let userPoints: Points = new Points();
	userPoints.points = 0;
	userPoints.user = user;
	
	let topic = room.topicInProgress();

	topic.participants.push(userPoints);

}
