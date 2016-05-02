angular
    .module('dexter')
    .controller('DashboardCtrl', ['$scope', '$http', function ($scope, $http) {

        var refreshAnalysis = function (callback) {
            $http
                .get('api/analysis')
                .then(function (response) {
                    console.log('Analysis refreshed');
                    var analysis = response.data
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
                    $scope.analysis = analysis;
                    if (callback)
                        callback();
                });
        }

        $scope.process = function () {
            $scope.isProcessing = true;
            $http
                .get('api/process')
                .then(function (response) {
                    refreshAnalysis(function () {
                        $scope.isProcessing = false;
                    })
                });
        }

        var init = function () {
            $scope.analysis = [];
            refreshAnalysis();
        }
        init();


    }])
    .service('PieChartService', function () {

        this.defaultConfig = {
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
    })
    .service('LineChartService', function () {
        this.defaultConfig = {
            title: {
                text: null
            },
            yAxis: [
                {
                    title: {text: ""},
                    //labels: {
                    //    style: {color: '#ffc838'}
                    //},
                    //opposite: true,
                    allowDecimals: false
                    //startOnTick: false,
                    //endOnTick: false
                }, {
                    title: {text: ""},
                    //labels: {
                    //    style: {color: '#ffc838'}
                    //},
                    opposite: true,
                    allowDecimals: false
                    //startOnTick: false,
                    //endOnTick: false
                }
            ],
            series: [
                {
                    name: 'Hits',
                    type: 'line',
                    yAxis: 0
                    //color: '#ffc838'
                }, {
                    name: 'Visits',
                    type: 'line',
                    yAxis: 1
                    //color: '#ffc838'
                }
            ],
            loading: true
        };
    })
    .controller('OsCtrl', ['$scope', '$http', 'PieChartService', function ($scope, $http, PieChart) {
        $scope.chartConfig = PieChart.defaultConfig;
        var init = function () {
            $http
                .get('api/logs/os')
                .then(
                    // Success
                    function (response) {
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
                        console.log(data);

                        // Update chart
                        var chart = $scope.chartConfig.getHighcharts();
                        chart.setTitle({text: 'Operating Systems'});
                        chart.series[0].setData(data);
                        chart.series.name = 'Operating Systems';
                        chart.hideLoading();

                    });

        };
        init();

    }])
    .controller('VisitsCtrl', ['$scope', '$http', 'LineChartService', function ($scope, $http, LineChart) {
        $scope.chartConfig = LineChart.defaultConfig;
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
                    console.log(dates, visits);

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

                    // Title


                    // Update data
                    chart.series[1].setData(visits);

                    // Hide loading
                    chart.hideLoading();


                });

        };
        init();

    }])
    .controller('BrowserCtrl', ['$scope', '$http', 'PieChartService', function ($scope, $http, PieChart) {
        $scope.chartConfig = PieChart.defaultConfig;
        var init = function () {
            $http
                .get('api/logs/browser')
                .then(
                    // Success
                    function (response) {
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
                        console.log(data);

                        // Update chart
                        var chart = $scope.chartConfig.getHighcharts();
                        chart.setTitle({text: 'Browsers'});
                        chart.series[0].setData(data);
                        chart.series.name = 'Browsers';
                        chart.hideLoading();

                    });

        };
        init();

    }])
    .controller('ResourcesCtrl', ['$scope', '$http', 'PieChartService', function ($scope, $http, PieChart) {
        var init = function () {
            $http
                .get('api/resources')
                .then(function (response) {
                    $scope.resources = response.data;
                });
        };
        init();

    }]);