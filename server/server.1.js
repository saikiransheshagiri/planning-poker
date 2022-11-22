const express = require('express');
const http = require('http');
const SocketIO = require('socket.io');
const path = require('path');
const {addRoom, deleteRoom, getRooms, addUser, removeUser, getUsers, addTopic, addPoints, updateTopic} = require('./planningController.js');
const bodyParser = require('body-parser');
const _ = require('lodash');

let app = express();
let server = http.Server(app);
let io = new SocketIO(server);
let port = process.env.PORT || 3000;

const appConstants = require('./constants');
const {User} = require('./user');
const {PLANNING_APP} = require('./planning');
const {Topic} = require('./topic');

app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use('/app', express.static(path.join(__dirname, '../app')));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//default route to app
app.get('/', (request, response) => {
	response.sendFile(path.join(__dirname, '../index.html'));
});

//create a room
app.post('/rooms', (request, response) => {
	let status = addRoom(request.body.roomName, request.body.accessCode);
	response.json(status);
	if(status.message === appConstants.ROOM_ADDED) {
		console.log('[INFO] New room added. Available rooms...');
	}
	else if(status.message === appConstants.ROOM_EXISTS) {
		console.log('[INFO] Invalid room name entered. Available rooms...');
	}
	
	console.log(status);

	io.emit('planning:rooms', status.content);
});

//delete a room
app.delete('/rooms', (request, response) => {
	let status = deleteRoom(request.body.roomName);

	if(status.message === appConstants.ROOM_DELETED) {
		console.log('[INFO] A room with name ' + request.body.roomName + ' is deleted. Available rooms...');
		console.log(status.content);
		response.send('Room deleted');
	}
	else if(status.message === appConstants.ROOM_INVALID) {
		console.log('[INFO] Invalid room name ' + request.body.roomName + ' to be deleted. Available rooms...');
		console.log(status.content);
		response.send('Unable to delete room. Invalid room.');
	}

	io.emit('planning:rooms', status.content);
});

/** Socket IO implementation - Start */

io.on('connection', (socket) => {
	//Users are by default connection to root/lobby '/' Emit the existing rooms
	io.emit('planning:rooms', getRooms());

	socket.on('planning:join-room', function(data) {
		console.log(data);
		var user = new User();

		user.name = data.name;
		user.isHost = data.isHost;
		user.isChicken = data.isChicken;

		if(PLANNING_APP.roomExists(data.roomName)) {
			var room = PLANNING_APP.getRoom(data.roomName);
			if(room.accessCode !== data.accessCode) {
				socket.emit('planning:invalid-accesscode');
			} else if(room.userExists(user)) {
				socket.emit('planning:invalid-username');
				console.log(room);
			} else if(user.isHost && room.getHost()) {
				socket.emit('planning:host-joined');
			} else {
				var status = addUser(user, room);

				if(status.message === appConstants.USER_ADDED) {
					//If a user is successfully added to the room, join the user to room
					socket.join(room.name);
					socket.room = room.name;
					socket.user = user.name;
					console.log(io.sockets.adapter.rooms);
					//Emit user added succesfully to the socket
					socket.emit('planning:user-added-room', status);
					console.log('emit the user added event');
					//emit welcome message to user
					socket.emit('planning:welcome-user', user);
					console.log('emit the welcome message to user');
					//Braoadcast user joined to the room
					socket.broadcast.to(room.name).emit('planning:user-joined', user);
					//send participant list to the room
					io.sockets.to(room.name).emit('planning:participant-list', room.users);	
					console.log(room);			
					console.log('emitting all particiapnts to room' + room.name);

					//if a topic in progress and user is a participant
					let cTopic = room.topicInProgress();
					if(typeof cTopic !== 'undefined') {

						if (!user.isHost && !user.isChicken) {
							updateTopic(room, user);
						}

						io.to(socket.room).emit('planning:story-inprogess', room.topicInProgress());
						io.to(socket.room).emit('planning:room-info', room);
					}
				} else {
					//Need to implement fail safe
				}
			}	
		} else {
			//TODO: emit an event about something went wrong invalid room 
			console.log(appConstants.ROOM_INVALID);
		}
		
		//Emit planning rooms with latest changes
		io.emit('planning:rooms', getRooms());
	});

	socket.on('planning:leave-room', function(){
		if(typeof socket.room !== 'undefined' && PLANNING_APP.roomExists(socket.room)) {
			let room = PLANNING_APP.getRoom(socket.room);

			if(typeof room !== 'undefined') {
				if(typeof socket.user !== 'undefined' && room.userExists(socket.user)) {
					let user = room.getUser(socket.user);
					let status = removeUser(user, room);

					if(status.message === appConstants.USER_REMOVED) {
						//Braoadcast user left to the room
						socket.broadcast.to(socket.room).emit('planning:user-left', socket.user);
						//send participant list to the room
						io.sockets.to(socket.room).emit('planning:participant-list', room.users);	
						io.to(socket.room).emit('planning:story-inprogess', room.topicInProgress());

						socket.emit('planning:left-planning');
						socket.leave(socket.room);

						//as user goes back to lobby display the current rooms
						io.emit('planning:rooms', getRooms());
					}
				} else {
					console.log(appConstants.USER_INVALID);
				}
			} else {
				console.log('Invalid room');
			}
		} else {
			console.log('socket disconnect: User didnt joined any room');
		}
	});

	socket.on('planning:set-story', function(topicName) {

		if(PLANNING_APP.roomExists(socket.room)) {
			let room = PLANNING_APP.getRoom(socket.room);
			let topic = new Topic();

			topic.topic = topicName;
			topic.isActive = true;

			let status = addTopic(room, topic);
			console.log(status);
			io.to(socket.room).emit('planning:story-inprogess', room.topicInProgress());
			io.to(socket.room).emit('planning:room-info', room);
		} else {
			console.log('Invalid room handle event - notify user');
		}
		
	});

	socket.on('planning:reset-topic', function(topic) {

		if(PLANNING_APP.roomExists(socket.room)) {
			let room = PLANNING_APP.getRoom(socket.room);
			room.resetTopics();

			io.to(socket.room).emit('planning:story-inprogess', room.topicInProgress());
		} else {
			console.log('Invalid room reset topic');
		}

	});

	socket.on('planning:send-points', function (points) {


		if(PLANNING_APP.roomExists(socket.room)) {
			let room = PLANNING_APP.getRoom(socket.room);
			let topic = room.topicInProgress();
			let user = room.getUser(socket.user);

			let participantPoints = _.find(topic.participants, { 'user': user });
			participantPoints.points = points;

			io.to(socket.room).emit('planning:story-inprogess', room.topicInProgress());

		} else {
			console.log('Invalid room sending points');
		}
		

	});

	socket.on('planning:reveal-points', function(){
		io.to(socket.room).emit('planning:show-points');
	});

	socket.on('disconnect', function () {
		if(typeof socket.room !== 'undefined' && PLANNING_APP.roomExists(socket.room)) {
			let room = PLANNING_APP.getRoom(socket.room);

			if(typeof room !== 'undefined') {
				if(typeof socket.user !== 'undefined' && room.userExists(socket.user)) {
					let user = room.getUser(socket.user);
					let status = removeUser(user, room);

					if(status.message === appConstants.USER_REMOVED) {
						//Braoadcast user left to the room
						socket.broadcast.to(socket.room).emit('planning:user-left', socket.user);
						//send participant list to the room
						io.sockets.to(socket.room).emit('planning:participant-list', room.users);	
						io.to(socket.room).emit('planning:story-inprogess', room.topicInProgress());
						socket.emit('planning:left-planning');
						socket.leave(socket.room);

						//as user goes back to lobby display the current rooms
						io.emit('planning:rooms', getRooms());
					}
				} else {
					console.log(appConstants.USER_INVALID);
				}
			} else {
				console.log('Invalid room');
			}
		} else {
			console.log('socket disconnect: User didnt joined any room');
		}
	});

});

/** Socket IO implementation - End */
server.listen(port, () => {
    console.log('[INFO] Listening on *:' + port);
});