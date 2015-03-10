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
            var data = resp.getDataTable();

            var table = new google.visualization.Table(document.getElementById("tablediv"));

            table.draw(data);

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
  ]).controller('MyCtrl3', ['$scope', '$routeParams', '$http',
    function($scope, $routeParams, $http) {

        // Google Console 專案名稱: RC-JSON-Data
        var OAuthModel = true;
        var client_id = '530939257520-6mku54g807m56qqvirhc3qieqdnm9rrb.apps.googleusercontent.com',
        scopes = [
            'https://www.googleapis.com/auth/userinfo.email',
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/drive',
            'https://spreadsheets.google.com/feeds',
            ],
        // 本地使用OAuth要設定 hostsName => C:\Windows\System32\drivers\etc\hosts
        // 127.0.0.1       alex.dai.io
        // 代理伺服器要關閉
        redirect_uri = "http://alex.dai.io:3000",
        oauthToken;

        var authButton = document.getElementById('authButton');
        authButton.style.display = 'none';

        var onAuthApiLoad = function() {
            gapi.auth.authorize(
                {
                  'client_id' : client_id,
                  //'redirect_uri' : redirect_uri,  // 不需要設定, 而是要在google console 設定JAVASCRIPT 來源
                  'scope' : scopes,
                  'immediate' : OAuthModel
                },
                handleAuthResult
            );
        };

        var handleAuthResult = function(authResult) {

          if (authResult && !authResult.error) {
            oauthToken = authResult.access_token;
            loadUserInfo();
            loadSpreadSheets();

          } else {
                // 未授權過,則顯示按鈕
                authButton.style.display = 'block';
                authButton.onclick = function() {
                    if ('immediate_failed' === authResult.error) {
                        OAuthModel = false; // 跳出授權視窗
                        onApiLoad();
                    } else {
                        console.log('非預期錯誤: ' + authResult.error);
                    }
                };
          }
          console.log(gapi.auth.getToken());
        };

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
            var sheetkey = '13M4ACBGWNQ8-iG5qbwirJF9uTGhaiuvBXhbK34qjNoM';
            var url = 'https://spreadsheets.google.com/feeds/list/' + sheetkey + '/2/private/full?alt=json&access_token=' + oauthToken;

            console.log(url);

            $http.get(url).success(function(data){
                console.log(data.feed.entry);
            });
        }

        function onApiLoad() {
          window.gapiAuthLoaded = true;
          //set the following up to avoid pop ups
          gapi.load('auth',{'callback' : onAuthApiLoad });
        }

        var script = document.createElement('script')
            script.setAttribute("type","text/javascript")
            script.setAttribute("src", 'https://apis.google.com/js/client.js?onload=onApiLoad');
            script.onload = function() {
                onApiLoad();
            }
        document.getElementsByTagName("head")[0].appendChild(script);
    }
  ]);