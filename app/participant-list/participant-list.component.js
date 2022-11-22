
function ParticipantListController() {
	console.log('component loaded');	
}

angular.module('app').component('participantList', {
	templateUrl: '/app/participant-list/participant-list.template.html',
	controller: ParticipantListController,
	bindings: {
		participants: '='
	}
});
