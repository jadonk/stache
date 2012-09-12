var http = require('http');
var https = require('https');
var fs = require('fs');
var OAuth = require('oauth').OAuth;
var child_process = require('child_process');
var keys = require('./twitterkeys');

function LED() {
    console.log("LED initialized");
    var trigger = "/sys/class/leds/lcd3\:\:usr0/trigger";
    var brightness = "/sys/class/leds/lcd3\:\:usr0/brightness";
    fs.writeFileSync(trigger, "none");
    fs.writeFileSync(brightness, "0");
    this.on = function() {
        console.log("LED on");
        fs.writeFileSync(brightness, "1");
    };
    this.off = function() {
        console.log("LED off");
        fs.writeFileSync(trigger, "none");
        fs.writeFileSync(brightness, "0");
    };
    this.blink = function() {
        console.log("LED blink");
        fs.writeFileSync(trigger, "timer");
    };
};
var led = new LED();

function sendTweet(tweet, photoName) {
    var hostname = 'upload.twitter.com';
    var path = '/1/statuses/update_with_media.json';
    var port = 443;
    //var ppath = 'https://' + hostname + path;
    //var phostname = 'webproxy.ext.ti.com';
    //var phostname = 'wwwgate.ti.com';
    //var pport = 80;
    //var proxy = 'http://' + phostname;

    var data = fs.readFileSync('./' + photoName);

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
    console.log('contents.length = ' + contents.length);
    console.log('' + contents);
    console.log('data.length = ' + data.length);
    console.log('footer.length = ' + footer.length);
    console.log('' + footer);
    console.log('multipartBody.length = ' + multipartBody.length);
    var index = 0;
    console.log('index = ' + index);
    for(var i = 0; i < contents.length; i++, index++) {
        multipartBody[index] = contents[i];
    }
    console.log('index = ' + index);
    for(var i = 0; i < data.length; i++, index++) {
        multipartBody[index] = data[i];
    }
    console.log('index = ' + index);
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

    console.log('options = ' + JSON.stringify(options));

    function printChunk(chunk) {
        console.log(chunk.toString());
    };
    function onRequestErr(err) {
        console.log('Error: Something is wrong.\n'+err+JSON.stringify(err)+'\n');
        led.blink();
    };
    function onRequestResponse(response) {            
        function printStatusCode() {
            console.log(response.statusCode +'\n');
            led.off();
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
    //console.log('stacheMessage = ' + data);
    try {
        data = JSON.parse(data);
        if(data.tweet && data.filename) {
            console.log('stacheMessage = ' + JSON.stringify(data));
            led.on();
            sendTweet(data.tweet, data.filename);
        }
    } catch(ex) {
    }
};
var stache = child_process.spawn('./stache', 
 ['-1','stache-mask.png','6','4','0','640','480','0.5'], 
 {stdio:['pipe', 'pipe', process.stderr]}
);
stache.stdout.setEncoding('ascii');
stache.stdout.on('data', stacheMessage);

function requestStache() {
    console.log('requestStache');
    stache.stdin.write('s');
};

//setInterval(requestStache, 5000);

