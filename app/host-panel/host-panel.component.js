
HostPanelController.$inject = ['$scope', 'PlanningService', 'PlanningEventConstants'];


function HostPanelController($scope, PlanningService, PlanningEventConstants) {
	console.log('HostPanelController component loaded');
	
	var self = this;
	self.topic = null;
	self.setTopic = function() {
		PlanningService.send(PlanningEventConstants.SET_STORY, self.topic);
	}

	self.resetTopic = function() {
		self.topic = null;
		PlanningService.send(PlanningEventConstants.RESET_TOPIC);
	}

	self.reveal = function() {
		PlanningService.send(PlanningEventConstants.REVEAL_POINTS);
	}
}

angular.module('app').component('hostPanel', {
	templateUrl: '/app/host-panel/host-panel.template.html',
	controller: HostPanelController,
	bindings: {
		topicInprogress: '='
	}
});
