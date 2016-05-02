angular
    .module('dexter')
    .controller('DashboardCtrl', ['$scope', '$http', function ($scope, $http) {

        var refreshAnalysis = function (callback) {
            $http
                .get('api/analysis')
                .then(function (response) {
                    $scope.analysis = response.data
                        .map(function (a) {
                            var date = new Date(a.date);
                            a.date = date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate() + ' ' + date.getHours() + ':' + date.getMinutes();
                            a.totalLogs = 0;
                            a.filenames = [];
                            a.logs = [];
                            a.files.forEach(function (file) {
                                a.totalLogs += file.logs;
                                a.logs.push(file.logs);
                                a.filenames.push(file.filename.split(/[\\/]/).pop());
                            });
                            return a;
                        });
                    if (callback)
                        callback();
                });
        };

        $scope.process = function () {
            $scope.isProcessing = true;
            $http
                .get('api/process')
                .then(function () {
                    refreshAnalysis(function () {
                        $scope.isProcessing = false;
                    })
                });
        };

        var init = function () {
            $scope.analysis = [];
            refreshAnalysis();
        };
        init();


    }])
    .controller('OsCtrl', ['$scope', '$http', function ($scope, $http) {
        $scope.chartConfig = {
            options: {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false,
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        },
                        showInLegend: true
                    }
                },
                tooltip: {
                    shared: true,
                    formatter: function () {
                        var per = Math.floor(this.point.percentage * 100) / 100;
                        return this.point.name + ': <b>' + per + '%</b>';
                    },
                    useHtml: true
                }
            },
            title: {
                text: ''
            },
            series: [{
                name: 'Operating Systems',
                colorByPoint: true,
                data: []
            }],
            loading: true
        };
        var init = function () {
            $http
                .get('api/logs/os')
                .then(function (response) {
                        var data = response.data;
                        var total = 0;
                        data = data
                            .map(function (os) {
                                total += os.count;
                                return {
                                    name: os._id,
                                    y: os.count
                                }
                            })
                            .map(function (os) {
                                os.y = Math.floor(os.y / total * 100) / 100;
                                return os;
                            });

                        // Update chart
                        var chart = $scope.chartConfig.getHighcharts();
                        chart.series[0].setData(data);
                        chart.series.name = 'Operating Systems';
                        chart.hideLoading();

                    });

        };
        init();

    }])
    .controller('VisitsCtrl', ['$scope', '$http', function ($scope, $http) {
        $scope.chartConfig = {
            title: {
                text: null
            },
            yAxis: [
                {
                    title: {text: ""},
                    allowDecimals: false
                }, {
                    title: {text: ""},
                    opposite: true,
                    allowDecimals: false
                }
            ],
            series: [
                {
                    name: 'Hits',
                    type: 'line',
                    yAxis: 0
                }, {
                    name: 'Visits',
                    type: 'line',
                    yAxis: 1
                }
            ],
            loading: true
        };
        var init = function () {
            $http
                .get('api/logs/date')
                .then(function (response) {
                    var data = response.data;

                    var dates = [];
                    var visits = [];

                    Object.keys(data).sort().forEach(function (year) {
                        Object.keys(data[year]).sort().forEach(function (month) {
                            Object.keys(data[year][month]).sort().forEach(function (day) {
                                dates.push(day + '/' + month);
                                visits.push(data[year][month][day]);
                            })
                        });
                    });

                    var chart = $scope.chartConfig.getHighcharts();

                    // X Axis
                    chart.xAxis[0].setCategories(dates);

                    // Update data
                    chart.series[0].setData(visits);

                    // Hide loading
                    chart.hideLoading();


                });
            $http
                .get('api/logs/visits')
                .then(function (response) {
                    var data = response.data;

                    var visits = [];

                    Object.keys(data).sort().forEach(function (year) {
                        Object.keys(data[year]).sort().forEach(function (month) {
                            Object.keys(data[year][month]).sort().forEach(function (day) {
                                visits.push(data[year][month][day]);
                            })
                        });
                    });

                    var chart = $scope.chartConfig.getHighcharts();

                    // Update data
                    chart.series[1].setData(visits);

                    // Hide loading
                    chart.hideLoading();


                });

        };
        init();

    }])
    .controller('BrowserCtrl', ['$scope', '$http', function ($scope, $http) {
        $scope.chartConfig = {
            options: {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false,
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                            style: {
                                color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                            }
                        },
                        showInLegend: true
                    }
                },
                tooltip: {
                    shared: true,
                    formatter: function () {
                        var per = Math.floor(this.point.percentage * 100) / 100;
                        return this.point.name + ': <b>' + per + '%</b>';
                    },
                    useHtml: true
                }
            },
            title: {
                text: ''
            },
            series: [{
                name: 'Operating Systems',
                colorByPoint: true,
                data: []
            }],
            loading: true
        };
        var init = function () {
            $http
                .get('api/logs/browser')
                .then(function (response) {
                        var data = response.data;
                        var total = 0;
                        data = data
                            .map(function (os) {
                                total += os.count;
                                return {
                                    name: os._id,
                                    y: os.count
                                }
                            })
                            .map(function (os) {
                                os.y = Math.floor(os.y / total * 100) / 100;
                                return os;
                            });

                        // Update chart
                        var chart = $scope.chartConfig.getHighcharts();
                        chart.series[0].setData(data);
                        chart.series.name = 'Browsers';
                        chart.hideLoading();

                    });

        };
        init();

    }])
    .controller('ResourcesCtrl', ['$scope', '$http', function ($scope, $http) {
        var init = function () {
            $http
                .get('api/resources')
                .then(function (response) {
                    $scope.resources = response.data;
                });
        };
        init();

    }]);