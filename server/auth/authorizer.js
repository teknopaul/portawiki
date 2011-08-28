/**
 * Configurable authorizer,
 * Set the authorizer to a module relative to this module that handles validating
 * username and password.
 * 
 * Authorizer modules must expose a function exports.authorize = function(username, password, cb)
 * 
 * If the authorizer function has a function called init() it will be called.
 *  
 */
var config = require('../util/config');

var hardcoded = require('./hardcoded-authorizer').authorize;
var xml = require('./xml-authorizer').authorize;
var pam = require('./pam-authorizer').authorize;

var selector = hardcoded;
swappable = function(username, password, cb) {
	return selector(username, password, cb);
};

config.emitter.on('configReady', function() {
	if (config.configData.authorizer == 'hardcoded') {
		selector = hardcoded;
	}
	else if (config.configData.authorizer == 'pam') {
		selector = pam;
	}
	else if (config.configData.authorizer == 'xml') {
		selector = xml;
	}
	else {
		console.error("No authorizer configured! " + config.configData.authorizer);
	}
	if (selector.init) {
		selector.init();
	}
});

exports.authorize = swappable;
