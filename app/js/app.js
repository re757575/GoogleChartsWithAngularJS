/**
 *
 * @authors Alex.Dai (https://github.com/re757575)
 * @date    2015-03-10 15:32:15
 * @version 1.0
 */

'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', [
	'ngRoute',
	'myApp.controllers',
	'myApp.services',
	'myApp.sharedServices',
	'myApp.filters',
	'sprintf',
	'ui.bootstrap',
	'smart-table',
	'ui.bootstrap.alert',
]).
config(['$routeProvider', '$locationProvider',
	function($routeProvider, $locationProvider) {
		$routeProvider.
			when('/login', {
				templateUrl: 'partials/login.html',
				controller: 'LoginCtrl'
			}).
			when('/home', {
				templateUrl: 'partials/home.html',
				controller: 'homeCtrl'
			}).
			when('/view1', {
				templateUrl: 'partials/view1.html',
				controller: 'view1Ctrl'
			}).
			when('/RC-Data-List', {
				templateUrl: 'partials/RC_Data_List.html',
				controller: 'RC_Data_List_Ctrl'
			}).
			when('/RC_Data/:tab', {
				templateUrl: 'partials/RC_Data.html',
				controller: 'RC_Ctrl'
			}).
			otherwise({
				redirectTo: '/login'
			});

		$locationProvider.html5Mode(true);
}]).
config(['$httpProvider',
	function($httpProvider) {
	$httpProvider.interceptors.push('authInterceptor');
}]).
run(function($rootScope, $location, AuthService, sessionService) {
	window.AuthService = AuthService;
	window.sessionService = sessionService;
	var routesThatRequireAuth = ['/home','/RC-Data-List','/login'];

	$rootScope.$on('$routeChangeStart', function(event, next, current) {
		console.log('------------$routeChangeStart------------');
		var userInfo = sessionService.get('userInfo');
		// TODO 利用 session ,免驗證
		if(_(routesThatRequireAuth).contains($location.path()) &&
			AuthService.isLoggedIn !== true) {
			//debugger;
			$location.path('/login');
		} else {
			if($location.path() == '/login') {
				$location.path('/home');
			}
		}
	});
});