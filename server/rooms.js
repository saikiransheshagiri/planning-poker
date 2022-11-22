const _ = require('lodash');

const ROOMS = [];	

/** Sample data of rooms */
//room:{'name': 'room1', 'access_code': '1234', 'users': [{'name': 'Jack', isHost: false, isChicken: false}]}


exports.addRoom = (roomName, accessCode) => {
	if(roomExists(roomName)){
		return {
			message: 'ALREADY_EXISTS',
			rooms: ROOMS
		}
	}
	else {
		ROOMS.push({
			name: roomName,
			accessCode: accessCode,
			users: [],
			topics: []
		});
		return {
			message: 'ADDED',
			rooms: ROOMS
		}
	}
}

exports.deleteRoom = (roomName) => {
	if(roomExists(roomName)) {
		_.remove(ROOMS, (room) => { return room.name === roomName});
		return {
			message: 'DELETED',
			rooms: ROOMS
		}
	}
	else {
		return {
			message: 'INVALID_ROOM',
			rooms: ROOMS
		}
	}
}

exports.getRooms = () => {
	return ROOMS;
}

exports.addUser = (userName, accessCode, isHost, isChicken, roomName) => {
	let user = {
		name: userName,
		isHost: isHost,
		isChicken: isChicken
	},
	message;

	let room = getRoom(roomName);

	if(room !== undefined) {
		if(room.accessCode === accessCode) {
			let hostJoinedAlready = _.some(room.users, { 'isHost': true});

			if(user.isHost && hostJoinedAlready){
				message = 'HOST JOINED ALREADY';
			} else {
					room.users.push(user);
				message = 'USER ADDED';
			}
		} else {
			message = 'INVALID ACCESS CODE';
		}
	} else {
		message = 'ROOM NOT FOUND';
	}
	
	return {
		message: message,
		user: user,
		room: room
	}
}

exports.removeUser = (userName, roomName) => {
	let room = getRoom(roomName);

	if(userExists(userName, room) && typeof room !== 'undefined') {
		_.remove(room.users, { 'name': userName });

		return {
			message: 'USER REMOVED',
			room: room
		}
	} 
	else {
		return {
			message: 'INVALID USER',
			room: room
		}
	}
}

exports.addTopic = (roomName, topicName) => {
	if(roomExists(roomName)) {
		let room = getRoom(roomName);
		let participantUsers = _.filter(room.users, { 'isHost': false, 'isChicken': false });


		let topic = {
			name: topicName,
			users: _.map(participantUsers, function(participant){
				participant.points = 0;
				return participant;
			})
		}

		room.topics.push(topic);
		console.log(topic);
		return {
			message: 'ADDED TOPIC',
			topic: topic,
			room: room
		}
	} else {
		console.log('invalid room name');
	}
}

exports.addPoints = (roomName, topicName, user, points) => {
	if(roomExists(roomName)) {
		let room = getRoom(roomName);

		//TODO: add valdiation here
		let topic = _.find(room.topics, {'name': topicName});

		let userPointed = _.find(topic.users, { 'name': user.name });
		userPointed.points = points;
		console.log(room);
		return {
			message: 'POINTS ADDED',
			user: userPointed,
			room: room,
			topic: topic
		};
	}
	else {
		console.log('INVALID ROOM NAME');
	}
}

exports.getUsers = (roomName) => {

	if(roomExists(roomName)) {
		let room = getRoom(roomName);
		return room.users;
	} else {
		return 'INVALID ROOM';
	}
}

function roomExists(roomName) {
	return _.some(ROOMS, (room) => { return room.name === roomName});
}

function getRoom(roomName) {
	return _.find(ROOMS, { 'name': roomName });
}

function userExists(userName, room) {
	return _.some(room.users, { 'name': userName });
}