/**
 *
 * @authors Alex.Dai (re757575.github.io)
 * @date    2015-03-19 10:05:35
 * @version 1.0
 */

'use strict';

angular.module('myApp.services', []).
	factory('AuthService', ['$rootScope','$http', '$q', '$location', '$window',
		function($rootScope, $http, $q, $location, $window) {

		// Google Console 專案名稱: RC-JSON-Data
		var service = {
				config: {
					OAuthModel: true,
					client_id: '530939257520-6mku54g807m56qqvirhc3qieqdnm9rrb.apps.googleusercontent.com',
					scopes: [
						'https://www.googleapis.com/auth/plus.login',
						'https://www.googleapis.com/auth/userinfo.email',
						'https://www.googleapis.com/auth/spreadsheets',
						'https://www.googleapis.com/auth/drive.file',
						'https://www.googleapis.com/auth/drive'
					],
					redirectPath: '/home',
				},

				token: null,
				isLoggedIn: null,
				session_state: null,

				getToken: function() {
				    return this.token;
				},

				clearToken: function() {
					this.token = null;
				},

				getScopeString: function() {
					var scopesStr = '';
					for (var i = 0; i < this.config.scopes.length; i++ ) {
					    if (i < this.config.scopes.length-1) {
					        scopesStr += this.config.scopes[i] + ' ';
					    } else {
					        scopesStr += this.config.scopes[i];
					    }
					}
					return scopesStr;
				},
				render: render,
				logout: logout,
				loadUserInfo: loadUserInfo,
				checkSessionState: checkSessionState,
				loadSpreadSheets: loadSpreadSheets,
				disconnectUser: disconnectUser
		};

		return service;

        function render() {
            gapi.signin.render('google_login', {
                'callback': function(authResult) {
				console.log(authResult);
				$("#loader").show();
				$("#google_login").hide();
					if (authResult) {
					    if(authResult["error"] == undefined) {
					        service.token = authResult.access_token;
					        service.isLoggedIn = true;
					        service.session_state = authResult.session_state
					        $location.path(service.config.redirectPath);
					        $rootScope.$apply();
							$("#logout").show();
					    } else {
					        service.isLoggedIn = false;
					        $("#google_login").show();
					    }
					}
					$("#loader").hide();
				},
                'approvalprompt': 'auto',
                'clientid': service.config.client_id,
                'cookiepolicy': 'single_host_origin',
                'requestvisibleactions': 'http://schemas.google.com/AddActivity',
                'scope': service.getScopeString()
            });
        };

		function disconnectUser() {
		    var revokeUrl = 'https://accounts.google.com/o/oauth2/revoke?token=' + service.token;
		    $.ajax({
		        type: 'GET',
		        url: revokeUrl,
		        async: false,
		        contentType: "application/json",
		        dataType: 'jsonp',
		        success: function(nullResponse) {
		            alert("取消應用程式連結成功！, 將自動登出");
		            service.logout();
		            window.open("https://plus.google.com/apps");
		        },
		        error: function(e) {
		            alert("取消應用程式連結失敗！請到 https://plus.google.com/apps 解除！");
		            window.open("https://plus.google.com/apps");
		        }
		    });
		};

		function logout() {
		    gapi.auth.signOut();
            service.isLoggedIn = false;
            service.token = null;
            $("#google_login").show();
		    $window.location.href = '/';
		};

		function checkSessionState() {
		    var sessionParams = {
		        'client_id': service.config.client_id,
		        'session_state': service.session_state
		    };
		    gapi.auth.checkSessionState(sessionParams, function(state){
				//console.log(sessionParams);
		        if (state == true) {
		            console.log("You be logged out");
		        } else {
		            console.log("You be logged in");
		        }
		    });
		}

		function loadUserInfo() {
		    gapi.client.load('oauth2', 'v2', function() {
		        var request = gapi.client.oauth2.userinfo.get();
		            request.execute(getUserInfoCallback);
		    });
		}

		function getUserInfoCallback(obj) {
		    console.log(obj);
		    return obj;
		}

		function loadSpreadSheets() {

		    var action = 'register'; // register 、 query
		    var queryType = 2; // only action = query
		    var guid = {'StarAccount': 1, 'User': 2, 'SendEmailLog': 3, 'OnLineLog': 4};
		    var tables = ['StarAccount', 'User', 'SendEmailLog', 'OnLineLog'];
		    // RC_Show gas api
		    var url = 'https://script.google.com/macros/s/AKfycbyMCXoJJhtZWctoHxX9Ptv3f_aEi_P2pa9qZ4g7gYOqEssAqEw/exec?action='+
		        action +'&guid='+ guid.StarAccount +'&tables='+ tables[guid.User -1] +'&queryType='+queryType+'&token='+ service.token +'&callback=JSON_CALLBACK';

		    $http.jsonp(url).success(function (data) {
				//debugger;
		        if(data === undefined) {
		            console.error('非預期錯誤: 無法取得資料');
		            return false;
		        }
		        if(data.error) {
		            console.error(decodeURI(data.error.message));
		        } else {
		            if(!data) {
		                console.error('非預期錯誤: 無法取得資料');
		            } else {
		                if (action == 'query') {
		                    if (queryType == 1) {
		                        console.info(data);
		                        //$scope.data = data.feed.entry;
		                    } else {
		                        console.info(data);
		                        //$scope.data = data.table.rows;
		                    }
		                } else if (action == 'register') {
		                    console.info(data.result);
		                }
		            }
		        }
		    });
		}

	}]);