const express = require('express');
const http = require('http');
const SocketIO = require('socket.io');
const path = require('path');
const {addRoom, deleteRoom, getRooms, addUser, removeUser, getUsers, addTopic, addPoints} = require('./rooms');
const bodyParser = require('body-parser');


let app = express();
let server = http.Server(app);
let io = new SocketIO(server);
let port = process.env.PORT || 3000;

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

	if(status.message === 'ADDED') {
		console.log('[INFO] New room added. Available rooms...');
		console.log(status.rooms);
	}
	else if(status.message === 'ALREADY_EXISTS') {
		console.log('[INFO] Invalid room name entered. Available rooms...');
		console.log(status.rooms);
	}
	
	io.emit('planning:rooms', status.rooms);
});

//delete a room
app.delete('/rooms', (request, response) => {
	let status = deleteRoom(request.body.roomName);

	if(status.message === 'DELETED') {
		console.log('[INFO] A room with name ' + request.body.roomName + ' is deleted. Available rooms...');
		console.log(status.rooms);
		response.send('Room deleted');
	}
	else if(status.message === 'INVALID_ROOM') {
		console.log('[INFO] Invalid room name ' + request.body.roomName + ' to be deleted. Available rooms...');
		console.log(status.rooms);
		response.send('Unable to delete room. Invalid room.');
	}

	io.emit('planning:rooms', status.rooms);
});

/** Socket IO implementation - Start */

io.on('connection', (socket) => {
	//Users are by default connection to root/lobby '/' Emit the existing rooms
	io.emit('planning:rooms', getRooms());

	socket.on('planning:join-room', function(data) {
		console.log(data);
		var response = addUser(data.name, data.accessCode, data.isHost, data.isChicken, data.roomName);

		switch(response.message) {
			case 'USER ADDED':
				//If a user is successfully added to the room, join the user to room
				socket.join(response.room.name);
				socket.room = response.room.name;
				socket.user = response.user.name;
				console.log(io.sockets.adapter.rooms);
				//Emit user added succesfully to the socket
				socket.emit('planning:user-added-room', response);
				console.log('emit the user added event');
				//emit welcome message to user
				socket.emit('planning:welcome-user', response.user);
				console.log('emit the welcome message to user');
				//Braoadcast user joined to the room
				socket.broadcast.to(response.room.name).emit('planning:user-joined', response.user);
				//send participant list to the room
				io.sockets.to(response.room.name).emit('planning:participant-list', response.room.users);	
				console.log(response.room);			
				console.log('emitting all particiapnts to room' + response.room.name);
				break;
			case 'ROOM NOT FOUND': 
				console.log('room not found');
				break;
			case 'HOST JOINED ALREADY':
				socket.emit('planning:host-joined');
				break;
			case 'INVALID ACCESS CODE':
				socket.emit('planning:invali-accesscode');
				break;
			default:
				console.log('Unable to add user');
			
		}
		
		//Emit planning rooms with latest changes
		io.emit('planning:rooms', getRooms());
	});

	socket.on('planning:leave-room', function(){
		let response = removeUser(socket.user, socket.room);

		switch(response.message) {
			case 'USER REMOVED':

				//Braoadcast user left to the room
				socket.broadcast.to(socket.room).emit('planning:user-left', socket.user);

				//send participant list to the room
				io.sockets.to(socket.room).emit('planning:participant-list', getUsers(socket.room));	

				socket.leave(socket.room);
				socket.emit('planning:left-planning');

				//as user goes back to lobby display the current rooms
				io.emit('planning:rooms', getRooms());
				break;
			case 'INVALID USER':
				break;
			default:
				console.log('Some thing broken here');
		}

		if(response && response.room && response.room.users && response.room.users.length === 0) {
			deleteRoom(response.room.name);
			io.emit('planning:rooms', getRooms());
		}
	});

	socket.on('planning:set-story', function(topic) {
		let response = addTopic(socket.room, topic);
		io.to(socket.room).emit('planning:story-inprogess', response.topic);
		console.log('enabling pointing');
		io.to(socket.room).emit('planning:enable-pointing');
	});

	socket.on('planning:reset-topic', function(topic) {

		io.to(socket.room).emit('planning:topic-closed');

		io.to(socket.room).emit('planning:disable-pointing');
	});

	socket.on('planning:send-points', function (details) {
		console.log(details);
		
		let response = addPoints(socket.room, details.topic, details.user, details.points);
		console.log(response);

		io.to(socket.room).emit('planning:topic-points', response.topic);

		socket.emit('planning:disable-pointing');
	});

	socket.on('planning:reveal-points', function(){
		io.to(socket.room).emit('planning:show-points');
	});

	socket.on('disconnect', function () {
		let response = removeUser(socket.user, socket.room);
		
		switch(response.message) {
			case 'USER REMOVED':	
				//Braoadcast user left to the room
				socket.broadcast.to(socket.room).emit('planning:user-left', socket.user);
				//send participant list to the room
				io.sockets.to(socket.room).emit('planning:participant-list', getUsers(socket.room));	
				socket.leave(socket.room);

				//as user goes back to lobby display the current rooms
				io.emit('planning:rooms', getRooms());
				break;
			case 'INVALID USER':
				break;
			default:
				console.log('Some thing broken here');
		}

		if(response && response.room && response.room.users && response.room.users.length === 0) {
			deleteRoom(response.room.name);
			io.emit('planning:rooms', getRooms());
		}
	});

});

/** Socket IO implementation - End */
server.listen(port, () => {
    console.log('[INFO] Listening on *:' + port);
});