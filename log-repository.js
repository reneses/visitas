var MongoClient = require('mongodb').MongoClient;

/**
 * Log repository
 *
 * @returns LogRepository
 * @constructor
 * @param host
 * @param port
 * @param db
 * @param user
 * @param pass
 */
var LogRepository = function (host, port, db, user, pass) {

    // Mongo url
    var url = 'mongodb://';
    if (user) {
        url += user;
        if (pass)
            url += ':' + pass;
        url += '@';
    }
    url += host + ':' + port + '/' + db;

    /**
     * Get the Mongo Collection of logs
     *
     * @param collectionName
     * @param callback
     */
    var getLogCollection = function (collectionName, callback) {
        MongoClient.connect(url, function (err, db) {
            if (err) { //TODO
                console.log(err);
            }
            var collection = db.collection(collectionName);
            callback(collection);
        });
    };


    //-------------------------- Operations --------------------------//

    /**
     * Get all the analysis done
     *
     * @param callback
     */
    var getAnalysis = function (callback) {
        getLogCollection('analysis', function (collection) {
            collection
                .find({})
                .sort( { date: -1 } )
                .toArray(function (err, docs) {
                    callback(docs);
                });
        });
    }

    /**
     * Insert an analysis
     *
     * @param analysis
     * @param callback
     */
    var insertAnalysis = function (analysis, callback) {
        getLogCollection('analysis', function (collection) {
            collection.insertOne(analysis, function (err, result) {
                callback(result.ops[0]);
            });
        });
    }

    /**
     * Update an analysis
     *
     * @param analysis
     */
    var addProcessedFileToAnalysis = function (analysis, file) {
        getLogCollection('analysis', function (collection) {
            collection.updateOne(
                {_id: analysis._id},
                {$push: {files: file}}
            );
        });
    }

    /**
     * Remove logs by filename
     *
     * @param filename
     */
    var removeLogsByFilename = function (filename) {
        getLogCollection('logs', function (collection) {
            collection.remove({filename: filename});
        });
    }

    /**
     * Inser a collection of logs
     *
     * @param logs
     */
    var insertLogs = function (logs) {
        getLogCollection('logs', function (collection) {
            collection.insertMany(logs);
        });
    };

    /**
     * Get all the logs
     *
     * @param callback
     */
    var getLogs = function (callback) {
        getLogCollection('logs', function (collection) {
            collection
                .find({}, {_id: 0})
                .toArray(function (err, docs) {
                    callback(docs);
                });
        });
    };

    /**
     * Group logs by OS
     *
     * @param callback
     */
    var groupLogsByOs = function (callback) {
        getLogCollection('logs', function (collection) {
            collection
                .aggregate([
                    {$group: {"_id": "$os.family", "count": {$sum: 1}}},
                    {$sort: {count: -1}}
                ])
                .toArray(function (err, docs) {
                    callback(docs);
                });

        });
    };

    /**
     * Group logs by browser
     *
     * @param callback
     */
    var groupLogsByBrowser = function (callback) {
        getLogCollection('logs', function (collection) {
            collection
                .aggregate([
                    {$group: {"_id": "$browser.name", "count": {$sum: 1}}},
                    {$sort: {count: -1}}
                ])
                .toArray(function (err, docs) {
                    callback(docs);
                });

        });
    };

    /**
     * Group logs by date
     *
     * @param callback
     */
    var groupLogsByDate = function (callback) {
        getLogCollection('logs', function (collection) {
            collection
                .aggregate([
                    {$group: {"_id": "$date", "count": {$sum: 1}}},
                    {$sort: {count: -1}}
                ])
                .toArray(function (err, docs) {
                    callback(docs);
                });

        });
    };

    /**
     * Group unique visits by date
     *
     * @param callback
     */
    var groupUniqueVisitsByDate = function (callback) {
        getLogCollection('logs', function (collection) {
            collection
                .aggregate([
                    {
                        $group: {
                            "_id": {date: "$date", remoteAddress: "$remoteAddress"},
                            remoteAddress: {$first: '$remoteAddress'},
                            count: {$sum: 1}
                        }
                    },
                    {$group: {"_id": "$_id.date", count: {$sum: 1}}},
                    {$sort: {count: -1}}
                ])
                .toArray(function (err, docs) {
                    callback(docs);
                });

        });
    };

    /**
     * Group resources by hits
     *
     * @param callback
     */
    var groupResourcesByHits = function (callback) {
        getLogCollection('logs', function (collection) {
            collection
                .aggregate([
                    {
                        $group: {
                            "_id": "$path",
                            "count": {$sum: 1},
                            "averageSize": {$avg: '$contentLength'},
                            "totalSize": {$sum: '$contentLength'}
                        }
                    },
                    {$sort: {count: -1}},
                    {$limit: 50}
                ])
                .toArray(function (err, docs) {
                    callback(docs);
                });

        });
    };

    return {
        getAnalysis: getAnalysis,
        insertAnalysis: insertAnalysis,
        addProcessedFileToAnalysis: addProcessedFileToAnalysis,
        removeLogsByFilename: removeLogsByFilename,
        insertLogs: insertLogs,
        getLogs: getLogs,
        groupLogsByOs: groupLogsByOs,
        groupLogsByBrowser: groupLogsByBrowser,
        groupLogsByDate: groupLogsByDate,
        groupVisitsByDate: groupUniqueVisitsByDate,
        groupResourcesByHits: groupResourcesByHits
    }

};

module.exports = LogRepository;