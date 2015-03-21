/**
 *
 * @authors Alex.Dai (re757575.github.io)
 * @date    2015-03-10 15:32:15
 * @version 1.0
 */

'use strict';

/* Controllers */

google.load('visualization', '1', {packages:['corechart','table']});

google.setOnLoadCallback(function() {
    //angular.bootstrap(document.body, ['myApp']);
    //console.log('Angualar bootstrap complete');
});

angular.module('myApp.controllers', []).
    controller('indexCtrl', ['$scope', '$window', 'AuthService', 'sessionService',
        function($scope, $window, AuthService, sessionService){
        $scope.logout = function() {
            AuthService.logout();
            sessionService.remove('userInfo');
        }
    }]).
    controller('homeCtrl', ['$scope', '$q', 'AuthService', 'sessionService', 'httpInterceptor',
        function($scope, $q, AuthService, sessionService, httpInterceptor) {
        if (AuthService.isLoggedIn) {

            var loadUserInfo = AuthService.loadUserInfo('plus').then(function(data) {
                $scope.userInfo = data;

                $scope.disconnectUser = function() {
                    $('#loaderDiv').show();
                    var disconnectUser = AuthService.disconnectUser().then(function(resp) {
                        $('#loaderDiv').hide();
                        alert("取消應用程式連結成功！, 將自動登出");
                        AuthService.logout();
                    }, function(error) {
                        $('#loaderDiv').hide();
                        alert("取消應用程式連結失敗！請到 https://plus.google.com/apps 解除！");
                        window.open("https://plus.google.com/apps");
                    });
                    //httpInterceptor(disconnectUser);
                };

                $('#profile').show();
                console.log('AuthService.loadUserInfo() 執行完畢!');

                sessionService.set('userInfo',JSON.stringify(data));
            });

            httpInterceptor(loadUserInfo);

            AuthService.checkSessionState();

            var loadSpreadSheets = AuthService.loadSpreadSheets().then(
                function(data) {
                    console.log('RC_Show fetch returned: ');
                    if (angular.isObject(data)) {
                        console.log(data);
                    }
                },
                function(data) {
                    console.log('RC_Show fetch failed: ' + data);
                }
            );
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
    controller('RC_Ctrl', ['$scope', '$routeParams', '$location', '$q', 'AuthService', 'httpInterceptor',
        function($scope, $routeParams, $location, $q, AuthService, httpInterceptor) {

            // TODO 因為有參數 所以 $routeChangeStart location.path 無法吻合, 需修增加判斷
            if (AuthService.getToken() == null) {
                $location.path('/login');
            }

            var tab = $routeParams.tab;
            var tables = ['StarAccount', 'User', 'SendEmailLog', 'OnLineLog'];
            var URL = 'https://docs.google.com/spreadsheets/d/13M4ACBGWNQ8-iG5qbwirJF9uTGhaiuvBXhbK34qjNoM/gviz/tq?sheet=' + tab;
            var query = new google.visualization.Query(URL);
            //runQuery();
            var data,table;
            var tablediv = document.getElementById("tablediv");

            (function (name) {
                $('#loaderDiv').show();
                if (name === undefined) {
                    name ='';
                }
                query.setQuery('select * where A LIKE "%'+ name +'%"');
                query.send(handleQueryResponse);
            })();

            $scope.change = function() {
                $('#loaderDiv').show();
                query.setQuery('select * where A LIKE "%'+ $scope.name +'%"');
                query.send(handleQueryResponse);
            };

            function handleQueryResponse(resp) {
                //debugger;
                if (resp.isError()) {
                    console.error('無法取得資料');
                    handleErrorResponse(resp, tablediv);
                } else {

                    data = resp.getDataTable();
                    table = new google.visualization.Table(tablediv);
                    table.draw(data);

                    google.visualization.events.addListener(table, 'select', selectHandler);

                    var jsonData = JSON.parse(data.toJSON());
                    var len = jsonData.rows.length;

                    console.log(jsonData);
                    $('#loaderDiv').hide();
                }
            }

            function handleErrorResponse(response, container) {
                var message = response.getMessage();
                var detailedMessage = response.getDetailedMessage();
                google.visualization.errors.addError(container, response.getMessage(),
                response.getDetailedMessage(), {'showInTooltip': true})
            }

            function readyHandler(e) {
                console.log('table ready');
            }

            function errorHandler(e) {
                alert('Error handler: ' + e.message);
            }

            function selectHandler() {
                var selection = table.getSelection();
                var message = '';
                for (var i = 0; i < selection.length; i++) {
                    var item = selection[i];
                    if (item.row != null && item.column != null) {
                        var str = data.getFormattedValue(item.row, item.column);
                        message += '{row:' + item.row + ',column:' + item.column + '} = ' + str + '\n';
                    } else if (item.row != null) {
                        var str = data.getFormattedValue(item.row, 0);
                        message += '{row:' + item.row + ', column:none}; value (col 0) = ' + str + '\n';
                    } else if (item.column != null) {
                        var str = data.getFormattedValue(0, item.column);
                        message += '{row:none, column:' + item.column + '}; value (row 0) = ' + str + '\n';
                    }
                }
                if (message == '') {
                    message = 'nothing';
                }
                alert('You selected ' + message);
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