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
  ]);