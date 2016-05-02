/*

 This script can be used to generate false traffic logs in order to test the functionality of 'visitas'. Usage:

 node /path/to/generate-logs.js [number of logs to generate] [directory to store the logs] 

 */

var path = require('path'),
    faker = require('faker'),
    fs = require('fs');


//-------------------------- Auxiliar functions --------------------------//

var pages = [
    {url: '/', code: 200, size: 455},
    {url: '/about', code: 200, size: 300},
    {url: '/contact', code: 200, size: 720},
    {url: '/history', code: 200, size: 400},
    {url: '/store', code: 200, size: 1002},
    {url: '/legal', code: 200, size: 3445},
    {url: '/found', code: 404, size: 0},
    {url: '/error', code: 400, size: 0},
    {url: '/style.js', code: 200, size: 2000},
    {url: '/index.js', code: 400, size: 2560},
    {url: '/video.mp4', code: 400, size: 50010},
    {url: '/logo.png', code: 400, size: 6031}
];
var clfmonth = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

var getRandomHttpMethod = function () {
    var r = Math.random();
    if (r < 0.60)
        return 'GET';
    if (r < 0.95)
        return 'POST';
    if (r < 0.98)
        return 'PUT';
    return 'DELETE';
};

var randomFromArray = function (array) {
    return array[Math.floor(Math.random() * array.length)];
};

var getRandomPage = function () {
    var page = randomFromArray(pages);
    if (page.code != 200)
        page = randomFromArray(pages);
    if (page.code != 200)
        page = randomFromArray(pages);
    return page;
};

var getRandomReferrer = function () {
    var r = Math.random();
    if (r < 0.3)
        return getRandomPage().url;
    if (r < 0.7)
        return faker.internet.url();
    return '-';
};

var getRandomResponseTime = function () {
    var time = Math.random();
    var r = Math.random();
    if (r < 0.95)
        time *= 1000;
    else
        time *= 10000;
    return Math.round(time * 100) / 100;
};

var pad2 = function (num) {
    var str = String(num);
    return (str.length === 1 ? '0' : '') + str
};

var clfdate = function (dateTime) {
    var date = dateTime.getUTCDate();
    var hour = dateTime.getUTCHours();
    var mins = dateTime.getUTCMinutes();
    var secs = dateTime.getUTCSeconds();
    var year = dateTime.getUTCFullYear();
    var month = clfmonth[dateTime.getUTCMonth()];
    return pad2(date) + '/' + month + '/' + year
        + ':' + pad2(hour) + ':' + pad2(mins) + ':' + pad2(secs)
        + ' +0000'
};

var incrementDateRandomly = function (date) {
    date.setMinutes(date.getMinutes() + 1 + Math.round(Math.random() * 20));
    date.setSeconds(Math.floor((Math.random() * 60) + 1));
};

var ips = [faker.internet.ip()];
var getRandomIp = function (date) {
    var r = Math.random();
    if (r < 0.6)
        return randomFromArray(ips);
    var ip = faker.internet.ip();
    ips.push(ip);
    return ip;
};


//-------------------------- Execution --------------------------//

// Retrieve the parameters
var args = process.argv.slice(2);
var numberOfLogs = args[0] || 1000;
var logDir = path.join(__dirname, args[1] || 'log');
fs.existsSync(logDir) || fs.mkdirSync(logDir);
var logPath = path.join(logDir, 'fake.log');


// Start processing
console.log('Generating ' + numberOfLogs + ' logs within the "/' + logPath + '" file');

// Generate the logs
var date = new Date();
var logs = [];
for (var i = 0; i < numberOfLogs; i++) {

    incrementDateRandomly(date);

    var page = getRandomPage();
    var ip = getRandomIp();
    var dateClf = clfdate(date);
    var method = getRandomHttpMethod();
    var code = page.code;
    var url = page.url;
    var size = page.size;
    var referrer = getRandomReferrer();
    var userAgent = faker.internet.userAgent();
    var responseTime = getRandomResponseTime();

    var log = `${ip} - - [${dateClf}] "${method} ${url} HTTP/1.1" ${code} ${size} "${referrer}" "${userAgent}" ${responseTime}`;
    logs.push(log);

}

// Write the logs into a file
fs.writeFile(logPath, logs.join('\n'), function (err) {
    if (err) {
        return console.log(err);
    }
    console.log("The file was saved!");
});