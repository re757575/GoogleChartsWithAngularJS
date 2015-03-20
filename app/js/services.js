/**
 *
 * @authors Alex.Dai (re757575.github.io)
 * @date    2015-03-19 10:05:35
 * @version 1.0
 */

'use strict';

angular.module('myApp.services', []).
	factory('AuthService', ['$rootScope','$http', '$q', '$location', function($rootScope, $http, $q, $location) {

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
				loadUserInfo: loadUserInfo
		};

		return service;

        function render() {
            gapi.signin.render('google_login', {
                'callback': function(authResult) {
				$("#loader").show();
				$("#google_login").hide();
					if (authResult) {
					    if(authResult["error"] == undefined) {
					        service.token = authResult.access_token;
					        service.isLoggedIn = true;
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
		    var revokeUrl = 'https://accounts.google.com/o/oauth2/revoke?token=' + gapi.auth.getToken().access_token;
		    $.ajax({
		        type: 'GET',
		        url: revokeUrl,
		        async: false,
		        contentType: "application/json",
		        dataType: 'jsonp',
		        success: function(nullResponse) {
		            $("#vip").hide();
		            $("#google_login").show();
		            alert("退出成功！");
		        },
		        error: function(e) {
		            alert("取消應用程式連結失敗！請到 https://plus.google.com/apps 解除！");
		            window.open("https://plus.google.com/apps");
		        }
		    });
		};

		function logout() {
		    gapi.auth.signOut();
            that.isLoggedIn = false;
            $("#google_login").show();
		    $location.path('/login');
		    $rootScope.$apply();
		};

		function checkSessionState() {
		    var sessionParams = {
		        'client_id': client_id,
		        'session_state': session_state
		    };

		    gapi.auth.checkSessionState(sessionParams, function(state){
		        console.log(state);
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
		    if(obj["email"]){
		        $("#email").html(obj["email"]);
		    }
		}

		function loadSpreadSheets() {

		    var action = 'register'; // register 、 query
		    var queryType = 2;
		    var guid = {'StarAccount': 1, 'User': 2, 'SendEmailLog': 3, 'OnLineLog': 4};
		    var tables = ['StarAccount', 'User', 'SendEmailLog', 'OnLineLog'];
		    // RC_Show
		    var url = 'https://script.google.com/macros/s/AKfycbyMCXoJJhtZWctoHxX9Ptv3f_aEi_P2pa9qZ4g7gYOqEssAqEw/exec?action='+
		        action +'&guid='+ guid.StarAccount +'&tables='+ tables[guid.User -1] +'&queryType='+queryType+'&token='+ oauthToken +'&callback=JSON_CALLBACK';

		    console.log(oauthToken);
		    $http.jsonp(url).success(function (data) {
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
		                    console.info(data);
		                }
		            }
		        }
		    });
		}

	}]);