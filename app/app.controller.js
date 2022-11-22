angular.module('app').controller('AppController', AppController);

AppController.$inject = ['PlanningService', 'PlanningEventConstants', '$rootScope', '$scope'];

function AppController(PlanningService, PlanningEventConstants, $rootScope, $scope) {

	var self = this;
	self.joinedPlanning = false;
	self.room = null;
	self.user = null;
	self.topicInprogress = null;



	//As soon as user joined the room show a welcome message
	PlanningService.listen(PlanningEventConstants.WELCOME_USER, function(participant){
		toastr.info('Welcome ' + participant.name.toUpperCase() + ', to the planning');
	});

	//show message when a user joined the room
	PlanningService.listen(PlanningEventConstants.PARTCIPANT_JOINED, function(participant){
		toastr.info(participant.name.toUpperCase() + ' joined the planning');
	});


	//re-load participants of the planning room whenever there is someone joins/leaves 
	PlanningService.listen(PlanningEventConstants.PARTICIPANT_LIST, function(participants){
		self.participants = participants;
	});
	

	PlanningService.listen(PlanningEventConstants.ROOM_INFO, function(room){
		self.room = room;
	});


	//set topic and topicInProgress when a topic message is received
	PlanningService.listen(PlanningEventConstants.STORY_INPROGRESS, function(topic){
		self.topicInprogress = topic;
	});
}