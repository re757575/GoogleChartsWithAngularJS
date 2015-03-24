/**
 *
 * @authors Alex.Dai (https://github.com/re757575)
 * @date    2015-03-24 20:21:41
 * @version 1.0
 */

// http://stackoverflow.com/questions/15266671/angular-ng-repeat-in-reverse
angular.module('myApp.filters', []).
	filter('reverse', function() {
		return function(items) {
			return items.slice().reverse();
		};
	}).
	filter('reverseArrayOnly', function() {
		return function(items) {
			if(!angular.isArray(items)) { return items; }
				return items.slice().reverse();
		};
	}).
	filter('reverseAnything', function() {
		return function(items) {
			if(typeof items === 'undefined') { return; }
			return angular.isArray(items) ?
			  items.slice().reverse() : // If it is an array, split and reverse it
			  (items + '').split('').reverse().join(''); // else make it a string (if it isn't already), and reverse it
		};
	});
