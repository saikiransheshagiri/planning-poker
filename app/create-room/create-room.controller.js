angular.module('app').controller('CreateRoomController', CreateRoomController);

CreateRoomController.$inject = ['PlanningService', '$uibModalInstance', '$scope', 'PlanningEventConstants', 'RoomsService', 'PlanningAppConstants'];


function CreateRoomController(PlanningService, $uibModalInstance, $scope, PlanningEventConstants, RoomsService, PlanningAppConstants){

	var self = this;
	self.roomAlreadyExists = false;

	self.create = function() {

		if(createForm.$invalid) {
			return;
		}
		//reset error messages
		self.roomAlreadyExists = false;
		self.rooms = [];

		RoomsService.createRoom(self.roomName, self.accessCode)
					.then(function(response){
						self.rooms = response.data.content;

						if(response.data.message === PlanningAppConstants.ROOM_ADDED) {
							$uibModalInstance.close(self.rooms);
						}
						else if(response.data.message === PlanningAppConstants.ROOM_EXISTS) {
							self.roomAlreadyExists = true;
						}
					}, function (error) {
						$uibModalInstance.dismiss(self.rooms);
						console.log('something went wrong with API request: ' + error);
					});


		
	}

	self.cancel = function() {
		$uibModalInstance.dismiss(self.rooms);
	}

}