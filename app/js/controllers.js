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
    controller('indexCtrl', ['$scope', '$window', 'AuthService', function($scope, $window, AuthService){
        $scope.logout = function() {
            gapi.auth.signOut();
            //$location.path('/');
            $window.location.href = '/';
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
        }
    ]).
    controller('RC_Ctrl', ['$scope', '$routeParams', '$location', 'AuthService',
        function($scope, $routeParams, $location, AuthService) {

            $scope.change = function(){alert();};
            if(AuthService.getToken() == null) {
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
                if (name === undefined) {
                    name ='';
                }
                query.setQuery('select * where A LIKE "%'+ name +'%"');
                query.send(handleQueryResponse);
            })();

            $scope.change = function() {
                query.setQuery('select * where A LIKE "%'+ $scope.name +'%"');
                query.send(handleQueryResponse);
            };

            function handleQueryResponse(resp) {
                if (resp.isError()) {
                    console.error('無法取得資料');
                    handleErrorResponse(resp, tablediv);
                } else {

                    data = resp.getDataTable();
                    table = new google.visualization.Table(tablediv);
                    table.draw(data);

                    /*
                    google.visualization.events.addListener(table, 'ready', readyHandler);
                    google.visualization.events.addListener(table, 'error', errorHandler);
                    */
                    google.visualization.events.addListener(table, 'select', selectHandler);

                    var jsonData = JSON.parse(data.toJSON());
                    var len = jsonData.rows.length;

                    console.log(jsonData);
                    //debugger;;
                    /*for (var i = 0; i < len; ++i) {
                        var row = jsonData.rows[i];
                        for (var j = 0; j < row.c.length; ++j) {
                            //console.log(row.c[j].v);
                        }
                    }*/
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
            if (AuthService.isLoggedIn === false) {
                AuthService.clearToken();
                $("#logout").hide();
                //debugger;
            }
            AuthService.render('/home');

            console.log(AuthService.getToken()); //  == null , 因為callback未執行完畢
        }
    ]);