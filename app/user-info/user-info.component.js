
function UserInfoController() {
	console.log('component loaded');	
}

angular.module('app').component('userInfo', {
	templateUrl: '/app/user-info/user-info.template.html',
	controller: UserInfoController,
	bindings: {
		user: '='
	}
});
