angular.module('app').controller('LoginController', LoginController);

LoginController.$inject = ['PlanningService', '$uibModalInstance', '$scope', 'PlanningEventConstants', 'room'];

function LoginController(PlanningService, $uibModalInstance, $scope, PlanningEventConstants, room){
	var self = this;
	self.isHost = false;
	self.isChicken = false;
	self.hostAlreadyJoined = false;
	self.invalidAccessCode = false;
	self.invalidUserName = false;

	PlanningService.listen(PlanningEventConstants.HOST_ALREADY_JOINED, function() {
		self.hostAlreadyJoined = true;
	});

	PlanningService.listen(PlanningEventConstants.USER_ADDED_ROOM, function(response){
		$uibModalInstance.close(response);
	});

	PlanningService.listen(PlanningEventConstants.INVALID_ACCESS_CODE, function() {
		self.invalidAccessCode = true;
	});

	PlanningService.listen(PlanningEventConstants.INVAID_USER_NAME, function() {
		self.invalidUserName = true;
	});

	self.join = function() {
		self.hostAlreadyJoined = false;
		self.invalidAccessCode = false;
		self.invalidUserName = false;

		PlanningService.send(PlanningEventConstants.JOIN_ROOM, {
			name: self.userName,
			accessCode: self.accessCode,
			isHost: self.isHost,
			isChicken: self.isChicken,
			roomName: room.name
		});
	}

	self.cancel = function() {
		$uibModalInstance.dismiss();
	}
}