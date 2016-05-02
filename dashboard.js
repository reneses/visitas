var path = require('path'),
    Api = require('./dashboard-api');

// Default Dashboard endpoint
var DEFAULT_DASHBOARD = 'visitas';


/**
 * Clear a url removing the leading and trailing dashes
 *
 * @param url
 * @returns string
 */
var clearUrl = function (url) {
    return url.replace(/^\//, '').replace(/\/+$/, '');
};


/**
 * Serve a resource file
 *
 * @param response
 * @param resource
 */
var serveFile = function (response, resource) {

    // By default, serve the index
    if (!resource)
        resource = 'index.html';

    // Serve the resource
    response.sendFile(path.join(__dirname, 'dashboard', resource));
};


/**
 * Dashboard
 *
 * @param endpoint Dashboard endpoint
 * @param logsDirectory Directory of the logs
 * @param mongo Mongo information
 * @returns Function Dashboard request handler
 * @constructor
 */
var Dashboard = function (endpoint, logsDirectory, mongo) {

    // Create the API
    var api = Api(logsDirectory, mongo);

    // Load the path value
    endpoint = clearUrl(endpoint || DEFAULT_DASHBOARD);

    // Returned function
    return function (req, res, next) {

        // If we are accessing the dashboard
        var url = clearUrl(req.url);
        if (url.indexOf(endpoint) == 0) {

            // If we are accessing to the dashboard without trailing /, redirect
            if (url == endpoint && req.url.slice(-1) != '/') {
                res.redirect(req.url + '/');
                return;
            }

            // Resource we are trying to access
            var resource = clearUrl(url.slice(endpoint.length));

            // First, check if it is an API function, if not, serve the file
            if (!api(resource, res))
                serveFile(res, resource);

        }

        // Otherwise, continue the processing
        else {
            next();
        }

    }

};

module.exports = Dashboard;