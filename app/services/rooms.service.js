angular.module('app').factory('RoomsService', RoomsService);

RoomsService.$inject = ['$http'];

function RoomsService($http) {
	
	function createRoom(roomName, accessCode) {
		
		return $http({
			method : "POST",
			url : "rooms",
			data : angular.toJson({
				'roomName': roomName,
				'accessCode': accessCode
			}),
			headers : {
				'Content-Type' : 'application/json'
			}
		});
	}

	return {
		createRoom: createRoom
	}
}