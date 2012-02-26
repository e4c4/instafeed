// http://expressjs.com/migrate.html
var express = require('express');

var app = express.createServer();
exports.app = app;

exports.appPort = process.env.PORT || 3000;
exports.CLIENT_ID = process.env.IG_CLIENT_ID || 'CLIENT_ID'
exports.CLIENT_SECRET = process.env.IG_CLIENT_SECRET || 'CLIENT_SECRET';
exports.CALLBACK_HOST = process.env.IG_CALLBACK_HOST;
exports.httpClient = (process.env.IG_USE_INSECURE ? require('http') : require('https'));
exports.apiHost = process.env.IG_API_HOST || 'api.instagram.com';
exports.apiPort = process.env.IG_API_PORT || null;
exports.basePath = process.env.IG_BASE_PATH || '';
if (process.env.REDISTOGO_URL) {
	var rtg = require("url").parse(process.env.REDISTOGO_URL);
	exports.REDIS_PORT = rtg.port;
	exports.REDIS_HOST = rtg.hostname;
	exports.REDIS_AUTH = rtg.auth.split(":")[1];
} else {
  	exports.REDIS_PORT = 6486;
  	exports.REDIS_HOST = '127.0.0.1';
  	//var redis = require("redis"); //.createClient();
}

exports.debug = true;

app.set('view engine', 'jade');

app.configure(function(){
    app.use(express.methodOverride());
	app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.static(__dirname + '/public/'));
});
app.configure('development', function(){
    app.use(express.logger());
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function(){
    app.use(express.errorHandler());
});
