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
  'myApp.controllers'
]).
config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
			when('/view1', {
			templateUrl: '/partials/partial1.html',
			controller: 'MyCtrl1'
		}).
		when('/view2/:tab', {
			templateUrl: '/partials/partial2.html',
			controller: 'MyCtrl2'
		}).
		otherwise({
			redirectTo: '/'
		});
}]);