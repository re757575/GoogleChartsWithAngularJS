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
		var config = {};
		var OAuthModel = true;
		var client_id = '530939257520-6mku54g807m56qqvirhc3qieqdnm9rrb.apps.googleusercontent.com',
		scopes = [
		    'https://www.googleapis.com/auth/plus.login',
		    'https://www.googleapis.com/auth/userinfo.email',
		    'https://www.googleapis.com/auth/spreadsheets',
		    'https://www.googleapis.com/auth/drive.file',
		    'https://www.googleapis.com/auth/drive',
		    //'https://spreadsheets.google.com/feeds',
		    ],
		// 本地使用OAuth要設定 hostsName => C:\Windows\System32\drivers\etc\hosts
		// 127.0.0.1       alex.dai.io
		// 代理伺服器要關閉
		redirect_uri = "http://alex.dai.io:3000",
		oauthToken,
		scopesStr = '';

		for (var i = 0; i < scopes.length; i++ ) {
		    if (i < scopes.length-1) {
		        scopesStr += scopes[i] + ' ';
		    } else {
		        scopesStr += scopes[i];
		    }
		}

		config.client_id = client_id;
		config.scopes = scopesStr;

		var isLoggedIn = false;
        /*var render = function() {
            gapi.signin.render('google_login', {
                'callback': signinCallback,
                'approvalprompt': 'auto',
                'clientid': '530939257520-6mku54g807m56qqvirhc3qieqdnm9rrb.apps.googleusercontent.com',
                'cookiepolicy': 'single_host_origin',
                'requestvisibleactions': 'http://schemas.google.com/AddActivity',
                'scope': scopesStr
            });
        };*/

		var signinCallback = function(authResult) {

		    if (authResult) {
		        if(authResult["error"] == undefined) {

		            //$("#google_login").hide();

		            /*gapi.client.load('plus','v1',function() {
		                var request=gapi.client.plus.people.get({'userId':'me'});
		                request.execute(function(profile) {
		                    $("#name").html(profile["displayName"]);
		                    $("#age").html(profile["ageRange"]["min"]);
		                    $("#head").attr("src",profile["image"]["url"]+"&sz=200");
		                });
		            });*/

		            //loadUserInfo();
		            oauthToken = authResult.access_token;
		            //AuthService.setToken(oauthToken);
		            //$("#vip").show();
		            //$("#logout").show();
		            //loadSpreadSheets();
		            //$location.path('/home');
		            // 因為使用第三官方的XHR,需使用 $scope.$apply() 告知 location 已變更
		            //$scope.$apply();
		            isLoggedIn = true;
		            //debugger;
		        } else {
		            //$("#google_login").show();
		            isLoggedIn = false;
		        }
		    }
		};

		var disconnectUser = function() {
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

		var logout = function() {
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

	    return {
			isLoggedIn: null,
	        token: null,
	        config: config,
	        getToken: function() {
	            return this.token;
	        },
	        clearToken: function() {
	        	this.token = null;
	        },
	        render: function(redirectPath) {
				$("#loader").show();
				$("#google_login").hide();
				var that = this;
				gapi.signin.render('google_login', {
				    'callback': function(authResult) {
					    if (authResult) {
					        if(authResult["error"] == undefined) {
					            that.token = authResult.access_token;
					            that.isLoggedIn = true;
					            $location.path(redirectPath);
					            $rootScope.$apply();
					             $("#logout").show();
					        } else {
					            that.isLoggedIn = false;
					            $("#google_login").show();
					        }
					    }
					    $("#loader").hide();
					    //debugger;
				    },
				    'approvalprompt': 'auto',
				    'clientid': that.config.client_id,
				    'cookiepolicy': 'single_host_origin',
				    'requestvisibleactions': 'http://schemas.google.com/AddActivity',
				    'scope': that.config.scopes
				});
				//debugger;
	        },
	        logout: function() {
	        	this.isLoggedIn = false;
			    gapi.auth.signOut();
	            $("#google_login").show();
			    $location.path('/login');
			    $rootScope.$apply();
			}
	    };
	}]);