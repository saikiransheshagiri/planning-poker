angular.module('app').controller('PlanningRoomController', PlanningRoomController);

PlanningRoomController.$inject = ['$uibModal', 'PlanningService', 'PlanningEventConstants', '$scope'];

function PlanningRoomController($uibModal, PlanningService, PlanningEventConstants, $scope) {

	var self = this;

	self.pointingEnabled = false;
	self.showPoints = false;

	//This is the start of Version1 code

	self.leave = function() {
		var r = confirm("Are you sure, you want to leave planning? (All data will be lost)");
		if (r == true) {	
			PlanningService.send(PlanningEventConstants.LEAVE_ROOM);
		} 
	}

	/** REGISTERING SOCKETIO EVENTS */

	//go back to lobby when user left the planning for current user
	PlanningService.listen(PlanningEventConstants.LEFT_PLANNING, function(participant){
		self.joinedPlanning = false;
		self.user = null;
		self.room = null;
	});

	//show a message when user left planning to all users in room
	PlanningService.listen(PlanningEventConstants.USER_LEFT_PLANNING, function(participant) {
		toastr.info(participant + ' left planning');
	});

	PlanningService.listen(PlanningEventConstants.SHOW_POINTS, function() {
		self.showPoints = true;
	});

}

angular.module('app').component('planningRoom', {
	templateUrl: '/app/planning-room/planning-room.template.html',
	controller: PlanningRoomController,
	controllerAs: 'planningRoomCtrl',
	bindings: {
		joinedPlanning: '=',
		user: '=',
		room: '=',
		participants: '=',
		topicInprogress: '='
	}
});
