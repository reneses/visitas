var LogProcessor = require('./log-processor'),
    LogRepository = require('./log-repository');

/**
 * Process a data response by date
 *
 * @param data
 * @returns {*}
 */
var processDataByDate = function (data) {
    return data.map(function (result) {
            var out = {};
            out[result._id.year] = {};
            out[result._id.year][result._id.month] = {};
            out[result._id.year][result._id.month][result._id.day] = result.count;
            return out;
        })
        .reduce(function (acc, data) {
            var newYear = Object.keys(data)[0];
            var newMonth = Object.keys(data[newYear])[0];
            var newDay = Object.keys(data[newYear][newMonth])[0];

            if (!acc[newYear])
                acc[newYear] = {};
            if (!acc[newYear][newMonth])
                acc[newYear][newMonth] = {};

            acc[newYear][newMonth][newDay] = data[newYear][newMonth][newDay];

            return acc;
        }, {})
};

/**
 * Dashboard API
 *
 * @param logsDirectory Directory of the logs
 * @param mongo Mongo information
 * @returns Function API
 * @constructor
 */
var Api = function(logsDirectory, mongo) {

    // Create the repository and th elogs processor
    var logRepository = LogRepository(mongo.host, mongo.port, mongo.db, mongo.user, mongo.password);
    var process = LogProcessor(logsDirectory, logRepository);

    /**
     * Process the log files
     *
     * @param response
     */
    var processLogs = function (response) {
        process()
        response.send('Processing');
    };

    //------------- Obtain data from repository and return it -------------//

    var getAnalysis = function (response) {
        logRepository.getAnalysis(function (analysis) {
            response.send(analysis);
        });
    };
    var getLogs = function (response) {
        logRepository.getLogs(function (logs) {
            response.send(logs);
        });
    };
    var groupLogsByOs = function (response) {
        logRepository.groupLogsByOs(function (logs) {
            response.send(logs);
        });
    };
    var groupLogsbyBrowser = function (response) {
        logRepository.groupLogsbyBrowser(function (logs) {
            response.send(logs);
        });
    };
    var groupLogsByDate = function (response) {
        logRepository.groupLogsByDate(function (logs) {
            response.send(processDataByDate(logs));
        });
    };
    var groupVisitsByDate = function (response) {
        logRepository.groupVisitsByDate(function (logs) {
            response.send(processDataByDate(logs));
        });
    };
    var groupResourcesbyHits = function (response) {
        logRepository.groupResourcesByHits(function (logs) {
            response.send(logs);
        });
    };

    /**
     * API function which returns true if the endpoint specified has been processed by the api
     */
    return function (endpoint, response) {

        switch (endpoint) {

            // If we want to update the DB (via async call)
            case 'api/process':
                processLogs(response);
                return true;

            // Analysis
            case 'api/analysis':
                getAnalysis(response);
                return true;

            // Logs
            case 'api/logs':
                getLogs(response);
                return true;

            // Logs by OS
            case 'api/logs/os':
                groupLogsByOs(response);
                return true;

            // Logs by browser
            case 'api/logs/browser':
                getLogsByBrowser(response);
                return true;

            // Group by date
            case 'api/logs/date':
                groupLogsByDate(response);
                return true;

            // Group by date
            case 'api/logs/visits':
                groupVisitsByDate(response);
                return true;

            // Resources
            case 'api/resources':
                groupResourcesbyHits(response);
                return true;

            default:
                return false;

        }
    }
    
}

module.exports = Api;