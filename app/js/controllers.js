/**
 *
 * @authors Alex.Dai (https://github.com/re757575)
 * @date    2015-03-10 15:32:15
 * @version 1.0
 */

'use strict';

/* Controllers */

angular.module('myApp.controllers', []).
    controller('indexCtrl', ['$scope', '$window', 'AuthService', 'sessionService',
        function($scope, $window, AuthService, sessionService){
        $scope.logout = function() {
            AuthService.logout();
            sessionService.remove('userInfo');
        }
    }]).
    controller('homeCtrl', ['$scope', '$q', '$window', 'AuthService', 'sessionService', 'httpInterceptor',
        function($scope, $q, $window, AuthService, sessionService, httpInterceptor) {
        if (AuthService.isLoggedIn) {

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
            var ssService = spreadSheetsService.loadData(guid).then(
                function(data) {
                    console.log('RC_Show fetch returned: ');
                    parseData(data);
                },
                function(error) {
                    $scope.RC_Data = [];
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
                            for (var i in data.feed.entry) {
                                // console.log(data.feed.entry[i]);
                                var entry = data.feed.entry[i],
                                    uid = entry.gsx$uid.$t,
                                    name = entry.gsx$name.$t,
                                    account = entry.gsx$account.$t;
                                obj.push({'uid': uid, 'name': name, 'account': account});
                            }
                        break;
                        case 'user':
                            for (var i in data.feed.entry) {
                                // console.log(data.feed.entry[i]);
                                var entry = data.feed.entry[i],
                                    email = entry.gsx$email.$t,
                                    favorites = entry.gsx$favorites.$t;
                                obj.push({'email': email, 'favorites': favorites});
                            }
                        break;
                        case 'sendEmailLog':
                            for (var i in data.feed.entry) {
                                // console.log(data.feed.entry[i]);
                                var entry = data.feed.entry[i],
                                    staruid = entry.gsx$staruid.$t,
                                    starname = entry.gsx$starname.$t,
                                    sendto = entry.gsx$sendto.$t,
                                    lastsenddate = entry.gsx$lastsenddate.$t,
                                    lastsenddatetime = entry.gsx$lastsenddatetime.$t;
                                obj.push({
                                    'staruid': staruid, 'starname': starname,
                                    'sendto': sendto, 'lastsenddate': lastsenddate,
                                    'lastsenddatetime': lastsenddatetime
                                });
                            }
                        break;
                        case 'onLineLog':
                            for (var i in data.feed.entry) {
                                // console.log(data.feed.entry[i]);
                                var entry = data.feed.entry[i],
                                    staruid = entry.gsx$staruid.$t,
                                    starname = entry.gsx$starname.$t,
                                    onlinedate = entry.gsx$onlinedate.$t,
                                    onlinedatetime = entry.gsx$onlinedatetime.$t,
                                    lastonlinetime = entry.gsx$lastonlinetime.$t,
                                    onlinetimes = entry.gsx$onlinetimes.$t,
                                    onlinetimetotalminute = entry.gsx$onlinetimetotalminute.$t;
                                obj.push({
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