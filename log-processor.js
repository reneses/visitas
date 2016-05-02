var fs = require('fs'),
    path = require('path'),
    platform = require('platform'),
    parseClf = require('clf-parser');


/**
 * Find all the log files within the directory
 *
 * @param logsDirectory Directory of the logs
 * @param callback Functionr receiving an array of file paths
 */
var findLogs = function (logsDirectory, callback) {
    fs.readdir(logsDirectory, function (err, files) {
        files = files.filter(function (name) {
            return path.extname(name) == '.log';
        }).map(function (name) {
            return path.join(logsDirectory, name)
        });
        callback(files);
    });
};

/**
 * Read a log file
 *
 * @param logPath Path to the file
 * @param callback Function processing the data within the log
 */
var readLog = function (logPath, callback) {
    fs.readFile(logPath, 'utf8', function (err, data) {
        callback(data);
    });
};

/**
 * Map a log string to a log object
 *
 * @param logString
 * @returns {{remoteAddress: *, method: *, path: *, status: *, contentLength: *, referer: *, userAgent: *, user: *}}
 */
var mapLog = function (logString) {

    //var matches = LOG_REGEX.exec(logString);

    // First parse the log
    var parsedLog = parseClf(logString);
    var log = {
        remoteAddress: parsedLog.remote_addr,
        method: parsedLog.method,
        path: parsedLog.path,
        status: parsedLog.status,
        contentLength: parsedLog.body_bytes_sent,
        referer: parsedLog.http_referer,
        userAgent: parsedLog.http_user_agent,
        user: parsedLog.remote_user
    };

    // Date
    var date = parsedLog.time_local;
    log.date = {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear()
    };
    log.time = {
        hour: date.getHours(),
        minute: date.getMinutes(),
        second: date.getSeconds()
    };

    // Time taken parsing
    var lastQuote = logString.lastIndexOf('"');
    if (lastQuote >= 0) {
        var responseTime = logString.substring(lastQuote + 1).trim();
        if (responseTime)
            log.responseTime = parseFloat(responseTime);
    }

    // Parse the platform info
    var platformInfo = platform.parse(log.userAgent);
    log.browser = {
        name: platformInfo.name,
        version: platformInfo.version
    };
    log.os = platformInfo.os;

    //  OS X special platform handling
    if (log.os.family != null && log.os.family.substring(0, 4) == 'OS X') {
        if (log.os.version == null)
            log.os.version = log.os.family.substring(5);
        if (log.os.version != null) {
            var product = log.os.version;
            var firstPoint = product.indexOf('.');
            var secondPoint = product.lastIndexOf('.');
            if (firstPoint != secondPoint)
                product = product.substring(0, product.lastIndexOf('.'));
            log.os.family = 'OS X ' + product;
        }
    }

    return log;

};

/**
 * Process an array of log strings
 *
 * @param logs
 * @param filename
 * @returns {Array}
 */
var processLogs = function (logStrings, filename) {
    return logStrings
        .split('\n')
        .filter(function (log) {
            return log;
        })
        .map(function (log) {
            log = mapLog(log);
            log.filename = filename;
            return log;
        });
};


/**
 * Log Processor
 *
 * It will find all the logs within the directory, process them and store them into the DB
 *
 * @param logsDirectory Directory of the logs
 * @param logRepository LogRepository
 * @returns {Function}
 * @constructor
 */
var LogProcessor = function (logsDirectory, logRepository) {

    /**
     * Process function
     */
    return function () {

        // Start the analysis
        var analysis = {
            date: new Date(),
            files: []
        }
        logRepository.insertAnalysis(analysis, function (analysis) {

            // Find log files
            findLogs(logsDirectory, function (files) {

                // Process each file
                files.forEach(function (file) {
                    readLog(file, function (logs) {
                        logs = processLogs(logs, file)
                        logRepository.removeLogsByFilename(file);
                        logRepository.insertLogs(logs);
                        logRepository.addProcessedFileToAnalysis(analysis, {
                            filename: file,
                            logs: logs.length
                        })
                    });
                });

            });

        });
    };
};

module.exports = LogProcessor;