PlanningTableController.$inject = ['PlanningService', 'PlanningEventConstants', '$scope'];

function PlanningTableController(PlanningService, PlanningEventConstants, $scope) {
	var self = this;

	$scope.$watch('$ctrl.topicInprogress', function(nTopic, oTopic) {
		if(!nTopic) {
			self.showPoints = false;
		}
	});
}

angular.module('app').component('planningTable', {
	templateUrl: '/app/planning-table/planning-table.template.html',
	controller: PlanningTableController,
	bindings: {
		topicInprogress: '=',
		isHost: '=',
		showPoints: '='
	}
});
