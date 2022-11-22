angular.module('app').factory('PlanningService', PlanningService);

PlanningService.$inject = ['PlanningEventConstants', '$rootScope']

function PlanningService(PlanningEventConstants, $rootScope) {
	var socket = io();

	function send(eventName, data, callback) {
		socket.emit(eventName, data, function () {
		  var args = arguments;
		  $rootScope.$apply(function () {
			if (callback) {
			  callback.apply(socket, args);
			}
		  });
		})
	  }

	function listen(eventName, callback) {
		socket.on(eventName, function () {  
		  	var args = arguments;
		  	$rootScope.$apply(function () {
				callback.apply(socket, args);
		  	});
		});
	}

	return {
		listen: listen,
		send: send,
		socket: socket
	}
}