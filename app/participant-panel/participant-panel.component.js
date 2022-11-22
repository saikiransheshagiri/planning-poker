
ParticipantPanelController.$inject = ['$scope', 'PlanningService', 'PlanningEventConstants'];

function ParticipantPanelController($scope, PlanningService, PlanningEventConstants) {
	var self = this;
	self.pointingEnabled = false;
	
	$scope.$watch('$ctrl.topicInprogress', function(nTopic, oTopic) {
		if(nTopic) {
			if(nTopic.participants && nTopic.participants.length) {
				var participantPoints = _.find(nTopic.participants, { 'user': self.user });

				if(participantPoints && participantPoints.points === 0) {
					self.pointingEnabled = true;	
				} else {
					self.pointingEnabled = false;
				}
			} 
		} else {
			self.pointingEnabled = false;
		}
	});

	self.sendPoints = _sendPoints;

	function _sendPoints(points) {

		if(self.pointingEnabled) {
			var r = confirm("Confirm your points - " + points);
			if (r) {
				PlanningService.send(PlanningEventConstants.SEND_POINTS, points);
			}
		}
	}
}

angular.module('app').component('participantPanel', {
	templateUrl: '/app/participant-panel/participant-panel.template.html',
	controller: ParticipantPanelController,
	bindings: {
		topicInprogress: '=',
		user: '='
	}
});
