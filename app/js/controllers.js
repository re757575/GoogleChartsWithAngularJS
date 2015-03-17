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
    angular.bootstrap(document.body, ['myApp']);
});

angular.module('myApp.controllers', []).
  controller('MyCtrl1', ['$scope',
    function($scope) {
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
  controller('MyCtrl2', ['$scope', '$routeParams',
    function($scope, $routeParams) {
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
  ]).controller('MyCtrl3', ['$scope', '$routeParams', '$http',
    function($scope, $routeParams, $http) {

        // Google Console 專案名稱: RC-JSON-Data
        var OAuthModel = true;
        var client_id = '530939257520-6mku54g807m56qqvirhc3qieqdnm9rrb.apps.googleusercontent.com',
        scopes = [
            'https://www.googleapis.com/auth/userinfo.email',
            //'https://www.googleapis.com/auth/spreadsheets',
            //'https://www.googleapis.com/auth/drive.file',
            //'https://www.googleapis.com/auth/drive',
            //'https://spreadsheets.google.com/feeds',
            ],
        // 本地使用OAuth要設定 hostsName => C:\Windows\System32\drivers\etc\hosts
        // 127.0.0.1       alex.dai.io
        // 代理伺服器要關閉
        redirect_uri = "http://alex.dai.io:3000",
        oauthToken;

        var authButton = document.getElementById('authButton');
        authButton.disabled = true;

        var onAuthApiLoad = function() {
            gapi.auth.authorize(
                {
                    'client_id' : client_id,
                    //'redirect_uri' : redirect_uri,  // 不需要設定, 而是要在google console 設定JAVASCRIPT 來源
                    'scope' : scopes,
                    'immediate' : OAuthModel,
                    'cookie_policy': 'single_host_origin'
                },
                handleAuthResult
            );
        };

        $scope.authResult = {};
        var handleAuthResult = function(authResult) {
            $scope.authResult = authResult;
            if (authResult && !authResult.error) {
                // authButton.style.display = 'none';
                oauthToken = authResult.access_token;
                loadUserInfo();
                //loadSpreadSheets();

            } else {
                // 未授權過,則顯示按鈕
                // authButton.style.display = 'block';
                $scope.OAuth = function(n) {
                    OAuthModel = false; // 跳出授權視窗
                    onApiLoad();
                };
            }
            if (authResult.error) {
                if ('immediate_failed' === authResult.error) {
                    authButton.innerText = '認證授權';
                    authButton.disabled = false;
                } else if ('access_denied' === authResult.error) {
                    authButton.innerText = '你不接受此授權!';
                    authButton.disabled = true;
                } else {
                    authButton.innerText = authResult.error;
                }
            } else {
                authButton.innerText = '已授權';
                authButton.disabled = true;
            }
                //checkSessionState();
                console.log(authResult);
                //console.log(gapi.auth);
                console.log(authResult.access_token);
        };

        function checkSessionState() {
            var sessionParams = {
                'client_id': client_id,
                'session_state': null
            };
            gapi.auth.checkSessionState(sessionParams, function(state){
                if (state == true) {
                  document.getElementById("msg").textContent = "You be logged out";
                } else {
                  document.getElementById("msg").textContent = "You be logged in";
                }
            });
        }

        $scope.logout = function() {
            gapi.auth.signOut();
            console.log($scope.authResult);
            //location.reload();
        }

        function loadUserInfo() {
            gapi.client.load('oauth2', 'v2', function() {
                var request = gapi.client.oauth2.userinfo.get();
                    request.execute(getUserInfoCallback);
            });
        }

        function getUserInfoCallback(obj) {
            console.log(obj);
        }

        function loadSpreadSheets() {

            var action = 'register'; // register 、query
            var queryType = 1;
            var guid = {'StarAccount': 1, 'User': 2, 'SendEmailLog': 3, 'OnLineLog': 4};
            var tables = ['StarAccount', 'User', 'SendEmailLog', 'OnLineLog'];
            // RC_Show
            var url = 'https://script.google.com/macros/s/AKfycbyMCXoJJhtZWctoHxX9Ptv3f_aEi_P2pa9qZ4g7gYOqEssAqEw/exec?action='+
                action +'&guid='+ guid.StarAccount +'&tables='+ tables[guid.User -1] +'&queryType='+queryType+'&token='+ oauthToken +'&callback=JSON_CALLBACK';

            console.log(url);
            $http.jsonp(url).success(function (data) {
                if(data.error) {
                    console.error(decodeURI(data.error.message));
                } else {
                    if(!data) {
                        console.error('非預期錯誤: 無法取得資料');
                    } else {
                        if (action == 'query') {
                            if (queryType == 1) {
                                console.info(data);
                                $scope.data = data.feed.entry;
                            } else {
                                console.info(data);
                                $scope.data = data.table.rows;
                            }
                        } else if (action == 'register') {
                            console.info(data);
                        }
                    }
                }
            });
        }

        function onApiLoad() {
          window.gapiAuthLoaded = true;
          //set the following up to avoid pop ups
          gapi.load('auth',{'callback' : onAuthApiLoad });
        }

        var script = document.createElement('script')
            script.setAttribute("type","text/javascript");
            script.async = true;
            script.setAttribute("src", 'https://apis.google.com/js/client.js?onload=onApiLoad');
            script.onload = function() {
                onApiLoad();
            }
        document.getElementsByTagName("head")[0].appendChild(script);

    }
  ]);