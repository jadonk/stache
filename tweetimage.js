var http = require('http');
var https = require('https');
var fs = require('fs');
var winston = require('winston');
var OAuth = require('oauth').OAuth;
var child_process = require('child_process');
var keys = require('./twitterkeys');

winston.add(winston.transports.File, { filename: '/var/log/beaglestache.log' });

function sendTweet(tweet, photoName) {
    var hostname = 'upload.twitter.com';
    var path = '/1/statuses/update_with_media.json';
    var port = 443;
    //var ppath = 'https://' + hostname + path;
    //var phostname = 'webproxy.ext.ti.com';
    //var phostname = 'wwwgate.ti.com';
    //var pport = 80;
    //var proxy = 'http://' + phostname;

    var data = fs.readFileSync(photoName);

    var oauth = new OAuth(
        'https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        keys.twitterKey, keys.twitterSecret,
        '1.0', null, 'HMAC-SHA1');

    var crlf = "\r\n";
    var boundary = Math.random().toString(16) + Math.random().toString(16);

    var separator = '--' + boundary;
    var footer = new Buffer(crlf + separator + '--' + crlf);
    var fileHeader = 'Content-Disposition: file; name="media[]"; filename="' + photoName + '"';

    var contents = new Buffer(separator + crlf
        + 'Content-Disposition: form-data; name="status"' + crlf
        + crlf
        + tweet + crlf
        + separator + crlf
        + fileHeader + crlf
        + 'Content-Type: image/jpeg' +  crlf
        + crlf);

    var multipartBodyLength = contents.length + data.length + footer.length;
    var multipartBody = new Buffer(multipartBodyLength);
    winston.info('contents.length = ' + contents.length);
    winston.info('' + contents);
    winston.info('data.length = ' + data.length);
    winston.info('footer.length = ' + footer.length);
    winston.info('' + footer);
    winston.info('multipartBody.length = ' + multipartBody.length);
    var index = 0;
    winston.info('index = ' + index);
    for(var i = 0; i < contents.length; i++, index++) {
        multipartBody[index] = contents[i];
    }
    winston.info('index = ' + index);
    for(var i = 0; i < data.length; i++, index++) {
        multipartBody[index] = data[i];
    }
    winston.info('index = ' + index);
    for(var i = 0; i < footer.length; i++, index++) {
        multipartBody[index] = footer[i];
    }

    var authorization = oauth.authHeader(
        'https://' + hostname + path,
        keys.accessToken, keys.tokenSecret, 'POST');

    var headers = {
        'Authorization': authorization,
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Host': hostname,
        'Content-Length': multipartBodyLength,
        'Connection': 'Keep-Alive'
    };

    var options = {
        host: typeof(phostname) !== 'undefined' ? phostname : hostname,
        path: typeof(ppath) !== 'undefined' ? ppath : path,
        port: typeof(pport) !== 'undefined' ? pport : port,
        method: 'POST',
        headers: headers
    };

    winston.info('options = ' + JSON.stringify(options));

    function printChunk(chunk) {
        winston.info(chunk.toString());
    };
    function onRequestErr(err) {
        winston.info('Error: Something is wrong.\n'+err+JSON.stringify(err)+'\n');
    };
    function onRequestResponse(response) {            
        function printStatusCode() {
            winston.info(response.statusCode +'\n');
        };
        response.setEncoding('utf8');            
        response.on('data', printChunk);
        response.on('end', printStatusCode);
    };
    var request = typeof(proxy) !== 'undefined' ? http.request(options) : https.request(options);     
    request.on('error', onRequestErr);
    request.on('response', onRequestResponse);
    request.write(multipartBody);
    request.end();
};

sendTweet("New #BeagleBone BeagleStache image captured at Embedded Linux Conference 2013 #lfelc! @BeagleBoardOrg", process.argv[2]);
