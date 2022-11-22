LobbyController.$inject = ['$scope', '$uibModal', 'PlanningEventConstants', 'PlanningService', 'PlanningAppConstants'];

function LobbyController($scope, $uibModal, PlanningEventConstants, PlanningService, PlanningAppConstants) {

	var self = this;
	self.rooms = [];

	self.create = _create;
	self.join = _join;

	function _create() {
		var createRoomModalInstance = $uibModal.open({
			templateUrl: '/app/create-room/create-room.template.html',
			controller: 'CreateRoomController as createRoomCtrl',
			keyboard: false,
			backdrop: 'static'
		});

		createRoomModalInstance.result.then(function (rooms) {
			console.log('closed');
		  }, function (error) {
			console.info('Modal dismissed at: ' + new Date());
		  });
	}

	function _join(room) {
		var loginModalInstance = $uibModal.open({
			templateUrl: '/app/login/login.template.html',
			controller: 'LoginController as loginCtrl',				
			keyboard: false,
			backdrop: 'static',
			resolve: {
				room: function(){
					return room;
				}
			}
		});
	
		loginModalInstance.result.then(function (response) {
			if(response.message === PlanningAppConstants.USER_ADDED) {
				self.joinedPlanning = true;
				self.user = response.content.user;
				self.room = response.content.room;
			}

			console.log(new Date() + ' :: LOGIN MODAL INSTANCE - CLOSED');
		  }, function (error) {
			console.info('Modal dismissed at: ' + new Date());
		  });
		
		console.log('Join the meeting: ' + room.name);
	}

	PlanningService.listen(PlanningEventConstants.EXISTING_ROOMS, function(rooms) {
		self.rooms = rooms;

		_.forEach(self.rooms, function(room) {
			if(room.users.length) {
				room.host = _.find(room.users, {'isHost': true});
			}
		})
	});

	console.log('Lobby controller loaded');
}

angular.module('app').component('lobby', {
	templateUrl: '/app/lobby/lobby.template.html',
	controller: LobbyController,
	controllerAs: 'lobbyCtrl',
	bindings: {
		joinedPlanning: '=',
		user: '=',
		room:'='
	}
});


