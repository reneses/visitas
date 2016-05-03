angular
    .module('visitas', ['ngRoute', 'highcharts-ng'])
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'partials/home.html',
                controller: 'DashboardCtrl'
            })
            .when('/visits', {
                templateUrl: 'partials/visits-overview.html',
                controller: 'VisitsCtrl'
            })
            .when('/os', {
                templateUrl: 'partials/technology-os.html',
                controller: 'OsCtrl'
            })
            .when('/browser', {
                templateUrl: 'partials/technology-browser.html',
                controller: 'BrowserCtrl'
            }).when('/resources', {
                templateUrl: 'partials/resources.html',
                controller: 'ResourcesCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });
    }])
    .filter('html', ['$sce', function ($sce) {
        return function (text) {
            return $sce.trustAsHtml(text);
        };
    }]);