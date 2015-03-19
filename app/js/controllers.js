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
    controller('LoginCtrl', ['$scope', '$routeParams', '$http', '$location', 'AuthService',
        function($scope, $routeParams, $http, $location, AuthService) {

            // Google Console 專案名稱: RC-JSON-Data
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

            var session_state = '';
            $scope.render = function() {
                gapi.signin.render('google_login', {
                    'callback': $scope.signinCallback,
                    'approvalprompt': 'auto',
                    'clientid': '530939257520-6mku54g807m56qqvirhc3qieqdnm9rrb.apps.googleusercontent.com',
                    'cookiepolicy': 'single_host_origin',
                    'requestvisibleactions': 'http://schemas.google.com/AddActivity',
                    'scope': scopesStr
                });
            };

            $scope.signinCallback = function(authResult) {

                if (authResult) {
                    if(authResult["error"] == undefined) {

                        $("#google_login").hide();

                        gapi.client.load('plus','v1',function() {
                            var request=gapi.client.plus.people.get({'userId':'me'});
                            request.execute(function(profile) {
                                $("#name").html(profile["displayName"]);
                                $("#age").html(profile["ageRange"]["min"]);
                                $("#head").attr("src",profile["image"]["url"]+"&sz=200");
                            });
                        });

                        //loadUserInfo();
                        oauthToken = authResult.access_token;
                        AuthService.setToken(oauthToken);
                        //$("#vip").show();
                        //$("#logout").show();
                        //loadSpreadSheets();
                        $location.path('/home');
                        // 因為使用第三官方的XHR,需使用 $scope.$apply() 告知 location 已變更
                        $scope.$apply();
                        //debugger;
                    } else {
                        $("#google_login").show();
                    }
                }
            };

            $scope.disconnectUser = function() {
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

            $scope.logout = function() {
                gapi.auth.signOut();
                $("#logout").hide();
                $("#login").show();
                location.reload();
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

            (function() {
                var script = document.createElement('script')
                    script.setAttribute("type","text/javascript");
                    script.async = true;
                    script.setAttribute("src", 'https://apis.google.com/js/client:plusone.js');
                    script.onload = function() {
                        $scope.render();
                    }
                document.getElementsByTagName("head")[0].appendChild(script);
            })();
        }
    ]);