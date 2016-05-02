var morgan = require('morgan'),
    fs = require('fs'),
    FileStreamRotator = require('file-stream-rotator');

// Morgan format, which corresponds with the Standard Apache combined log output with the response time appended
var MORGAN_FORMAT = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time';

// Default values
var DEFAULT_FILENAME = 'access';
var DEFAULT_ROTATION = true;

/**
 * Create a Write Stream that will be used to write the logs
 *
 * @param logsDirectory Directory where the logs will be stored
 * @param logsPrefix Filename prefix for the logs
 * @param rotateLogs True if the logs should be daily rotated
 *
 * @return WriteStream to use
 */
var getLogStream = function(logsDirectory, logsPrefix, rotateLogs) {

    // Rotate or not
    if (typeof rotateLogs === 'undefined')
        rotateLogs = DEFAULT_ROTATION;

    // If we want to rotate logs
    if (rotateLogs) {
        return FileStreamRotator.getStream({
            date_format: 'YYYYMMDD',
            filename: logsDirectory + '/' + logsPrefix + '-%DATE%.log',
            frequency: 'daily',
            verbose: false
        });
    }

    // Otherwise, create a simple write stream
    return fs.createWriteStream(logsDirectory + '/' + logsPrefix + '.log', {flags: 'a'});
};

/**
 * Logger
 *
 * @param logsDirectory Directory of the logs
 * @param opt Options
 * @returns {Function} Logging function
 */
var Logger = function(logsDirectory, opt) {

    opt = opt || {};

    // Log filename prefix
    var logsPrefix = (opt.filename || DEFAULT_FILENAME).replace(/\..*/, '');
   
    // Log writer
    var accessLogStream = getLogStream(logsDirectory, logsPrefix, opt.rotation);
    
    // Obtain the logging function
    return morgan(MORGAN_FORMAT, {stream: accessLogStream});

};

module.exports = Logger;