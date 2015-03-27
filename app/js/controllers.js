/**
 *
 * @authors Alex.Dai (https://github.com/re757575)
 * @date    2015-03-10 15:32:15
 * @version 1.0
 */

'use strict';


function url_base64_decode(str) {
  var output = str.replace('-', '+').replace('_', '/');
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += '==';
      break;
    case 3:
      output += '=';
      break;
    default:
      throw 'Illegal base64url string!';
  }
  return window.atob(output); //polifyll https://github.com/davidchambers/Base64.js
}

/* Controllers */

angular.module('myApp.controllers', []).
    controller('indexCtrl', ['$scope', '$window', 'AuthService', 'sessionService',
        function($scope, $window, AuthService, sessionService){
        $scope.logout = function() {
            AuthService.logout();
            sessionService.remove('userInfo');
        }
    }]).
    controller('homeCtrl', ['$http', '$scope', '$q', '$window', 'AuthService', 'sessionService', 'httpInterceptor',
        function($http, $scope, $q, $window, AuthService, sessionService, httpInterceptor) {
        if (AuthService.isLoggedIn) {

  $scope.user = {username: 'john.doe', password: 'foobar'};
  $scope.isAuthenticated = false;
  $scope.welcome = '';
  $scope.message = '';

  $scope.submit = function () {
    $http
      .post('/authenticate', $scope.user)
      .success(function (data, status, headers, config) {
        $window.sessionStorage.token = data.token;
        $scope.isAuthenticated = true;
        var encodedProfile = data.token.split('.')[1];
        var profile = JSON.parse(url_base64_decode(encodedProfile));
        $scope.welcome = 'Welcome ' + profile.first_name + ' ' + profile.last_name;
        debugger;
      })
      .error(function (data, status, headers, config) {
        // Erase the token if the user fails to log in
        delete $window.sessionStorage.token;
        $scope.isAuthenticated = false;

        // Handle login errors here
        $scope.error = 'Error: Invalid user or password';
        $scope.welcome = '';
      });
  };


  $scope.logout = function () {
    $scope.welcome = '';
    $scope.message = '';
    $scope.isAuthenticated = false;
    delete $window.sessionStorage.token;
  };

 $scope.callRestricted = function () {
    $http({url: '/api/restricted', method: 'GET'})
    .success(function (data, status, headers, config) {
      $scope.message = $scope.message + ' ' + data.name; // Should log 'foo'
    })
    .error(function (data, status, headers, config) {
      alert(data);
    });
  };


            $scope.alerts = [];
            var loadUserInfo = AuthService.loadUserInfo('plus').then(function(data) {

                $scope.userInfo = data;
                $('#profile').show();
                console.log('AuthService.loadUserInfo() 執行完畢!');

                $scope.disconnectUser = function() {
                    var confirm = $window.confirm("您確定取消應用程式連結嗎? 這將會自動登出!");
                    if (confirm) {
                        $('#loaderDiv').show();
                        var disconnectUser = AuthService.disconnectUser().then(function(resp) {
                            $window.alert("取消應用程式連結成功！, 將自動登出");
                            AuthService.logout();
                        }, function(error) {
                            $window.alert("取消應用程式連結失敗！請到 https://plus.google.com/apps 解除！");
                            $window.open("https://plus.google.com/apps");
                        });
                        httpInterceptor(disconnectUser);
                    }
                };
                sessionService.set('userInfo',JSON.stringify(data));

            }, function(error) {
                $scope.alerts = [{
                    type: 'danger',
                    msg: "google+ 資料讀取失敗! 請重新登入。 錯誤訊息: " + error.message
                }];
            });

            loadUserInfo.then(function() {
                // httpInterceptor(bindDisconnectUser());
            });

            httpInterceptor(loadUserInfo);

            AuthService.checkSessionState();

            // function bindDisconnectUser() {
            //     var disconnectUser;
            //     $scope.disconnectUser = function() {
            //         $('#loaderDiv').show();
            //         disconnectUser = AuthService.disconnectUser().then(function(resp) {
            //             alert("取消應用程式連結成功！, 將自動登出");
            //             AuthService.logout();
            //         }, function(error) {
            //             alert("取消應用程式連結失敗！請到 https://plus.google.com/apps 解除！");
            //             window.open("https://plus.google.com/apps");
            //         });
            //         return disconnectUser;
            //     };
            //     return disconnectUser;
            // }
        }
    }]).
    controller('view1Ctrl', ['$scope', 'AuthService',
        function($scope, AuthService) {
            var data = google.visualization.arrayToDataTable([
                ['Year', 'Sales', 'Expenses'],
                ['2004', 1000, 400],
                ['2005', 1170, 460],
                ['2006', 660, 1120],
                ['2007', 1030, 540]
            ]);
            var options = {
                title: 'Company Performance'
            };
            var chart = new google.visualization.LineChart(document.getElementById('chartdiv'));

            chart.draw(data, options);
            if (AuthService.isLoggedIn) {
                $("#homeLink").show();
            }
            $('#loaderDiv').hide();
        }
    ]).
    controller('RC_Data_List_Ctrl', ['$scope', function($scope){
        $('#loaderDiv').hide();
    }]).
    controller('RC_Ctrl', ['$scope', '$routeParams', '$location', '$q', 'AuthService', 'httpInterceptor', 'spreadSheetsService',
        function($scope, $routeParams, $location, $q, AuthService, httpInterceptor, spreadSheetsService) {

            // TODO 因為有參數 所以 $routeChangeStart location.path 無法吻合, 需修增加判斷
            if (AuthService.getToken() == null) {
                $location.path('/login');
            }

            var tab = $scope.tab = $routeParams.tab;
            var guid = spreadSheetsService.guid[tab];
            if (guid === undefined) {
                $location.path('/RC-Data-List');
                $scope.$apply();
            }
            //debugger;
            $scope.alerts = [];
            spreadSheetsService.guidSelect = guid;
            spreadSheetsService.action = 'query';
            var ssService = spreadSheetsService.loadData().then(
                function(data) {
                    console.log('RC_Show fetch returned: ');
                    parseData(data);
                },
                function(error) {
                    $scope.RC_Data = [];
                    $scope.alerts = [{
                        type: 'danger',
                        msg: '資料讀取失敗! 錯誤訊息: ' + error
                    }];

                    $scope.closeAlert = function(index) {
                        $scope.alerts.splice(index, 1);
                    };

                    console.log('RC_Show fetch failed: ' + error);
                    console.log('spreadSheetsService.loadData() 執行失敗!');
                }
            );
            httpInterceptor(ssService);

            function parseData(data) {
                if (angular.isObject(data)) {
                    // console.log(data.feed.updated);
                    // console.log(data.feed.openSearch$totalResults);
                    // console.log(data.feed.entry);
                    var obj = [];

                    switch(tab) {
                        case 'starAccount':
                            var count = 0;
                            for (var i in data.feed.entry) {
                                // console.log(data.feed.entry[i]);
                                var entry = data.feed.entry[i],
                                    uid = entry.gsx$uid.$t,
                                    name = entry.gsx$name.$t,
                                    account = entry.gsx$account.$t;
                                obj.push({'count': ++count, 'uid': uid, 'name': name, 'account': account});
                            }
                        break;
                        case 'user':
                            var count = 0;
                            for (var i in data.feed.entry) {
                                // console.log(data.feed.entry[i]);
                                var entry = data.feed.entry[i],
                                    email = entry.gsx$email.$t,
                                    favorites = entry.gsx$favorites.$t;
                                obj.push({'count': ++count, 'email': email, 'favorites': favorites});
                            }
                        break;
                        case 'sendEmailLog':
                            var count = 0;
                            for (var i in data.feed.entry) {
                                // console.log(data.feed.entry[i]);
                                var entry = data.feed.entry[i],
                                    staruid = entry.gsx$staruid.$t,
                                    starname = entry.gsx$starname.$t,
                                    sendto = entry.gsx$sendto.$t,
                                    lastsenddate = entry.gsx$lastsenddate.$t,
                                    lastsenddatetime = parseInt(entry.gsx$lastsenddatetime.$t,10);
                                obj.push({
                                    'count': ++count,
                                    'staruid': staruid, 'starname': starname,
                                    'sendto': sendto, 'lastsenddate': lastsenddate,
                                    'lastsenddatetime': lastsenddatetime
                                });
                            }
                        break;
                        case 'onLineLog':
                            var count = 0;
                            for (var i in data.feed.entry) {
                                // console.log(data.feed.entry[i]);
                                var entry = data.feed.entry[i],
                                    staruid = entry.gsx$staruid.$t,
                                    starname = entry.gsx$starname.$t,
                                    onlinedate = entry.gsx$onlinedate.$t,
                                    onlinedatetime = entry.gsx$onlinedatetime.$t,
                                    lastonlinetime = entry.gsx$lastonlinetime.$t,
                                    onlinetimes = parseInt(entry.gsx$onlinetimes.$t,10),
                                    onlinetimetotalminute = parseInt(entry.gsx$onlinetimetotalminute.$t,10);
                                obj.push({
                                    'count': ++count,
                                    'staruid': staruid, 'starname': starname,
                                    'onlinedate': onlinedate, 'onlinedatetime': onlinedatetime,
                                    'lastonlinetime': lastonlinetime, 'onlinetimes': onlinetimes,
                                    'onlinetimetotalminute': onlinetimetotalminute
                                });
                            }
                        break;
                        default:
                        break;
                    }

                    $scope.RC_Data = obj;
                    console.log('spreadSheetsService.loadData() 執行成功!');
                }
            }
        }
    ]).
    controller('LoginCtrl', ['$scope', '$routeParams', '$http', '$location', '$q', 'AuthService',
        function($scope, $routeParams, $http, $location, $q, AuthService) {

            if (!AuthService.isLoggedIn) {
                AuthService.clearToken();
                $("#logout").hide();
                //debugger;
            }
            AuthService.render('#google_login', '#loader').then(
                function(data) {
                    console.log('AuthService returned: ' + data);
                    $("#loader").hide();
                    console.log('Token:' + AuthService.getToken());
                },
                function(data) {
                    console.log('AuthService retrieval failed: ' + data);
                    $("#loader").hide();
                    $("#google_login").show();
                }
            ).then(function() {});

            $('#loaderDiv').hide();
        }
    ]);