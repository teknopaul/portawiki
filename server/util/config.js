/**
 * Configuration object loaded from XML, XML support comments config files should have comments, JSON never thought of that.
 * 
 * file loaded is ../conf/config.xml
 * 
 * As is typical, it is loaded asynchronously so attach a listener for the 'configReady' event
 * to this modules config object.
 * 
 * This module also exposes configData which may or may not be initalized.
 */

var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var sax = require("sax"),
  strict = true, // set to false for html-mode
  parser = sax.parser(strict);

var emitter = new EventEmitter(); 
/**
 * The configuration obejct.
 */
var config = {
	initialized : false ,
	basedir : './' ,
	appjsdir : '' ,
	datadir : '' ,
	port : 8888,
	authorizer : 'hardcoded',
	key : null,
	debug : 'false'
};

var tagState = '';

parser.onerror = function (e) {
	// an error happened.
};
parser.ontext = function (text) {
	if (text.trim().length == 0) {
		return;
	}
	if(tagState == 'basedir') {
		config.basedir = text;
	}
	else if(tagState == 'appjsdir') {
		config.appjsdir = text;
	}
	else  if(tagState == 'datadir') {
		config.datadir = text;
	}
	else  if(tagState == 'port') {
		config.port = text;
	}
	else  if(tagState == 'authorizer') {
		config.authorizer = text;
	}
	else  if(tagState == 'key') {
		config.key = text;
	}
	else  if(tagState == 'debug') {
		config.debug = text;
	}
};
parser.onopentag = function (node) {
	tagState = node.name;
};
parser.onattribute = function (attr) {
	// an attribute.  attr has "name" and "value"
};
parser.onend = function () {
	// parser stream is done, and ready to have more stuff written to it.
	config.initialized = true;
	console.log("Serving pages from " + config.basedir);
	emitter.emit('configReady', config);
	validate();
};

fs.readFile('../conf/config.xml', function (err, data) {
	if (err) {
		console.error("Can not load config file @ ../conf/config.xml");
		//throw err; not convenient for nodeunit tests
		// instead try ../../ which will probably work
		fs.readFile('../../conf/config.xml', function (err, data) {
			if ( !err) {
				parser.write(data.toString('utf8')).close();
			}
		});
	}
	else {
		parser.write(data.toString('utf8')).close();
	}
});


var validate = function() {
	fs.stat(config.basedir, function(err, stat) {
		if (err) {
			console.error("Trouble reading basedir " + config.basedir);
		}
	});
	fs.stat(config.appjsdir, function(err, stat) {
		if (err) {
			console.error("Trouble reading appjsdir " + config.appjsdir);
		}
	});
	/* no data for now
	fs.stat(config.basedir, function(err, stat){
		if (err) {
			console.error("Trouble reading basedir " + config.basedir);
		}
	});
	*/
};

/**
 * If we have already loaded call listener immediately
 */
emitter.on('newListener', function(listener, callback) { // undocumented node.js feature, 2nd arg is the function callback
	if (config.initialized) {
		callback(config);
	}
});

exports.configData = config;
exports.emitter = emitter;
