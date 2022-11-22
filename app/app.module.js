angular.module('app', ['ui.bootstrap'])
.run(function ($window) {
	$window.onbeforeunload = function(event) {
		// do some stuff here, like reloading your current state
		//this would work only if the user chooses not to leave the page
		return 'why would you do that???';
	}
});
