
// angular.module('app').config(function($stateProvider, $urlRouterProvider, $locationProvider) {
// 	$locationProvider.html5Mode(true);
// 	$urlRouterProvider.otherwise('/');
// 	$stateProvider
// 		.state('lobby', {
// 			url: '/',
// 			templateUrl: '/app/lobby/lobby.template.html',
// 			controller: 'LobbyController as lobbyCtrl'
// 		})
// 		.state('room', {
// 			url: '/room/{roomName}',
// 			templateUrl: '/app/planning-room/planning-room.template.html',
// 			controller: 'PlanningRoomController as planningRoomCtrl',
// 			params: {
// 				user: null,
// 				room: null
// 			}
// 		});
// });