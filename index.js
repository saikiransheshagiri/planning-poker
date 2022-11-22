var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var _ = require('lodash');
var process = require('process');
var path = require('path');

var port = process.env.PORT || 3000;

app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/app', express.static(path.join(__dirname, 'app')));

app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

var clients = [];

io.on('connection', function (socket) {

	console.log(socket.id);

	socket.on('planning:join', function (userInfo) {
		console.log(userInfo);

		var isHostAvailable = _.find(clients, { 'isHost': true });

		if(userInfo.host && isHostAvailable) {
			socket.emit('planning:host-joined');
			console.log('host already exist');
		} else {

			var client = {
				"id": socket.id,
				"user_name": userInfo.name,
				"isHost": userInfo.host,
				"points": 0
			}
			console.log(client);

			clients.push(client);

			socket.emit('planning:welcome-user', client);

			socket
				.broadcast
				.emit('planning:user-joined', client);

			
			io.emit('planning:participant-list', clients);
			console.log('new user joined');
		}
	});

	socket.on('disconnect', function () {
		console.log('user disconnected');
		var user;
		_.remove(clients, function(client) {
			user = client;
			return client.id === socket.id;
		});

		socket
		.broadcast
		.emit('user-left', user);
	});

	socket.on('planning:set-story', function (topicInfo){

		io.emit('planning:story-inprogess', {
			"clients": clients,
			"topic": topicInfo
		});

		io.emit('planning:enable-pointing');

		console.log('set topic: ' + topicInfo);
	})

	socket.on('planning:send-points', function (details) {
		console.log(details);
		_.forEach(clients, function(client) {
			if (client.id === details.socket_id) {
				client.points = details.points;
				return;
			}
		});

		io.emit('planning:story-inprogess', {
			"clients": clients,
			"topic": {name: details.topic}
		});

		socket.emit('planning:disable-pointing');
	});

	socket.on('planning:reveal-points', function(){
		io.emit('planning:show-points');
	});

	socket.on('planning:reset-topic', function() {
		_.forEach(clients, function(client) {
			client.points = 0;
		})

		io.emit('planning:story-inprogess', {
			"clients": clients,
			"topic": null
		});

		io.emit('planning:disable-pointing');
	});

});

http.listen(port, function () {
	console.log('listening on *:port');
});