var http = require('http');
var https = require('https');
var fs = require('fs');
var winston = require('winston');
var OAuth = require('oauth').OAuth;
var child_process = require('child_process');
var config = {};

winston.add(winston.transports.File, { filename: '/var/log/beaglestache.log' });

try {
    config = require('./config');
} catch(ex) {
    winston.info("Not tweeting, no keys found: " + ex);
    config.trigger = "/sys/class/leds/lcd3\:\:usr0/trigger";
    config.brightness = "/sys/class/leds/lcd3\:\:usr0/brightness";
    config.twitterKey = false;
    config.message = "New #BeagleBone BeagleStache image captured! @BeagleBoardOrg";
}

function LED() {
    winston.info("LED initialized");
    var trigger = config.trigger;
    var brightness = config.brightness;
    fs.writeFileSync(trigger, "none");
    fs.writeFileSync(brightness, "0");
    this.on = function() {
        winston.info("LED on");
        fs.writeFileSync(brightness, "1");
    };
    this.off = function() {
        winston.info("LED off");
        fs.writeFileSync(trigger, "none");
        fs.writeFileSync(brightness, "0");
    };
    this.blink = function() {
        winston.info("LED blink");
        fs.writeFileSync(trigger, "timer");
    };
};
var led = new LED();

function sendTweet(tweet, photoName) {
    if(!config.twitterKey) {
        led.blink();
        return;
    }
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
        config.twitterKey, config.twitterSecret,
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
        config.accessToken, config.tokenSecret, 'POST');

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
        led.blink();
    };
    function onRequestResponse(response) {            
        function printStatusCode() {
            winston.info(response.statusCode +'\n');
            if(response.statusCode == 200) led.off();
            else {
                led.blink();
                var resendTweet = function() {
                    sendTweet(tweet, photoName);
                }
                setTimeout(resendTweet, 60000);
            }
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

function stacheMessage(data) {
    winston.log('debug', 'stacheMessage = ' + data);
    try {
        data = JSON.parse(data);
        if(data.tweet && data.filename) {
            winston.info('stacheMessage = ' + JSON.stringify(data));
            led.on();
            sendTweet(config.message, data.filename);
        }
    } catch(ex) {
    }
};
var stacheExit = function(code, signal) {
    winston.info('stache exited: ' + code + ' signal: ' + signal);
};
var stache = child_process.spawn('./stache', 
 ['stache-mask.png', 'stache-2.png', 'stache-robclark.png'], 
 {stdio:['pipe', 'pipe', process.stderr]}
);
stache.stdout.setEncoding('ascii');
stache.stdout.on('data', stacheMessage);
stache.on('exit', stacheExit);

function requestStache() {
    winston.info('requestStache');
    stache.stdin.write('s');
};

// turn on the display every 30 seconds
setInterval(unblankDisplay, 30000);
function unblankDisplay() {
    try {
        fs.writeFileSync("/sys/class/graphics/fb0/blank", "0");
    } catch(ex) {
    }
};

//setInterval(requestStache, 5000);

