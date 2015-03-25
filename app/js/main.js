/**
 *
 * @authors Alex.Dai (https://github.com/re757575)
 * @date    2015-03-21 23:01:30
 * @version 1.0
 */

'use strict';

requirejs.config({
    // 所有js的根目錄，相對於HTML
    baseUrl: 'bower_components',
    waitSeconds: 7,
    paths: {
        // js的路径， 相對於 baseUrl
        'requirejs-plugins': 'requirejs-plugins/lib/require',
        'angular': 'angular/angular.min',
        'angular-route': 'angular-route/angular-route.min',
        'angular-sprintf': 'sprintf/dist/angular-sprintf.min',
        'sprintf': 'sprintf/dist/sprintf.min',
        'app': '../js/app',
        'services': '../js/services',
        'filters': '../js/filters',
        'controllers': '../js/controllers',
        'jquery': 'jquery/dist/jquery.min',
        'underscore': 'underscore/underscore-min',
        'async' : 'requirejs-plugins/src/async', //alias to plugin
        'propertyParser': 'requirejs-plugins/src/propertyParser',
        'goog': 'requirejs-plugins/src/goog',
        'moment': 'moment/min/moment.min',
        'angular-bootstrap': 'angular-bootstrap/ui-bootstrap.min',
        'angular-bootstrap-tpls': 'angular-bootstrap/ui-bootstrap-tpls.min'
    },
    shim: {
		'async': {},
        // 需要匯出一個名為 angular 的全域變數，不然無法使用
        'angular' : { exports: 'angular', eps: ['async'] },
        // 設定 angular 的其它模組依賴 angular 核心模組
        'angular-route': { deps: ['angular'] },
        'sprintf': {},
        'angular-sprintf': { deps: ['sprintf', 'angular'] },
        'app': { deps: ['angular','angular-route'] },
        'services': { deps: ['app'] },
        'filters': { deps: ['app'] },
        'controllers': { deps: ['app','services', 'filters'] },
        'propertyParser': { deps: ['async'] },
        'goog': { deps: ['async','propertyParser'] },
        'moment': {},
        'angular-bootstrap':{ deps: ['angular', 'app'] },
        'angular-bootstrap-tpls':{ deps: ['angular', 'app', 'angular-bootstrap'] },
    }
});

require(
	[
		'angular',
		'async!https://apis.google.com/js/client:plusone.js!onload',
		'angular-route',
		'app',
        'services',
        'filters',
		'controllers',
		'jquery',
		'underscore',
        'sprintf',
        'angular-sprintf',
        'moment',
        'angular-bootstrap',
        'angular-bootstrap-tpls',
	],
	function(angular) {
	    console.info(angular.version);
	    angular.bootstrap(document.body, ['myApp']);
	    console.log('Angualar bootstrap complete');
	}
);

define(
	[
        'goog!visualization,1,packages:[corechart,table]',
	], function(goog){
        //all dependencies are loaded (including gmaps and other google apis
    }
);

requirejs.onError = function (err) {
	if (err.requireType === 'timeout') {
	    alert("js載入錯誤: " + err);
	}
	else {
		throw err;
	}
};