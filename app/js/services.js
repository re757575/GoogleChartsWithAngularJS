/**
 *
 * @authors Alex.Dai (re757575.github.io)
 * @date    2015-03-19 10:05:35
 * @version 1.0
 */

'use strict';

angular.module('myApp.services', []).
	factory('AuthService', /*['$rootScope','$http',*/function(/*$rootScope, $http*/) {
	    return {
	        token: null,
	        setToken: function(n) {
	            this.token = n;
	        },
	        getToken: function() {
	            return this.token;
	        }
	    };
	}/*]*/);