var fs = require('fs'),
    path = require('path'),
    Dashboard = require('./dashboard'),
    Logger = require('./logger');

// Default directory for logs
var DEFAULT_LOGS_DIRECTORY = 'log';

// Default behaviour for logging
var DEFAULT_LOG = true;

/**
 * Retrieve the directory of the logs from the options
 * - Absolute value to the directory, or relative to the npm module
 * - The directory will be created if it does not exist
 *
 * @param opt Options
 * @returns string Directory of the logs
 */
var getLogsDirectory = function (opt) {
    var logsDirectory =  opt.directory || path.join(__dirname, DEFAULT_LOGS_DIRECTORY);
    fs.existsSync(logsDirectory) || fs.mkdirSync(logsDirectory);
    return logsDirectory;
};

/**
 * Check the options to see if we shoud use the logger
 *
 * @param opt Options
 * @returns Truthy value if the logger has to be used, false otherwise
 */
var useLogger = function (opt) {
    opt = opt || {};
    if (typeof opt.log === 'undefined')
        return DEFAULT_LOG;
    return opt.log;
};


/**
 * Create the main object returning a function to handle requests
 *
 * @param mongo Object containing the information about mongo
 *              Properties:
 *                  - host
 *                  - port
 *                  - db
 *                  - user (optional)
 *                  - password (optional)
 * @param opt Options
 *            Properties:
 *                  - log (boolean/object) [default true]
 *                      - filename (string): Filename prefix for the logs
 *                      - rotation (boolean): Use daily rotation
 *                  - directory (string): Directory for the logs
 *                  - dashboard (boolean/string): Dashboard endpoint
 * @returns {Function}
 * @constructor
 */
var Visitas = function (mongo, opt) {

    // Allow call without params
    opt = opt || {};

    // Directory for the logs
    var logsDirectory = getLogsDirectory(opt);

    // Logger
    if (useLogger(opt)) {
        var logger = Logger(logsDirectory, opt.log);
    }

    // Obtain the dashboard function
    var dashboard = Dashboard(opt.dashboard, logsDirectory, mongo);

    // Returned function
    return function (req, res, next) {

        // Check if we are accessing the dashboard
        dashboard(req, res, function() {

            // Log request
            if (logger)
                logger(req, res, next);

        });
    }
};

module.exports = Visitas;