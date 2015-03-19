/**
 *
 * @authors Alex.Dai (re757575.github.io)
 * @date    2015-03-10 15:32:15
 * @version 1.0
 */

'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.controllers',
  'myApp.services'
]).
config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
		when('/login', {
			templateUrl: '/partials/login.html',
			controller: 'LoginCtrl'
		}).
		when('/home', {
			templateUrl: '/partials/home.html',
			//controller: 'homeCtrl'
		}).
		when('/view1', {
			templateUrl: '/partials/view1.html',
			controller: 'view1Ctrl'
		}).
		when('/RC-Data-List', {
			templateUrl: '/partials/RC_Data_List.html',
		}).
		when('/RC_Data/:tab', {
			templateUrl: '/partials/RC_Data.html',
			controller: 'RC_Ctrl'
		}).
		otherwise({
			redirectTo: '/login'
		});
}]).
run(function($rootScope, $location, AuthService) {
  var routesThatRequireAuth = ['/home','/RC-Data-List','/login'];

	$rootScope.$on('$routeChangeStart', function(event, next, current) {
		console.log(AuthService);
		if(_(routesThatRequireAuth).contains($location.path()) && AuthService.isLoggedIn !== true) {
			//debugger;
			$location.path('/login');
		} else {
			if($location.path() == '/login') {
				$location.path('/home');
			}
		}
	});
});