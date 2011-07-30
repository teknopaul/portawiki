/**
 * Configurable authorizer,
 * Set the authorizer to a module relative to this module that handles validating
 * username and password.
 *  
 *  TODO XML based.
 *  
 */
var config = require('../util/config');

var hardcoded = require('./hardcoded-authorizer').authorize;
var xml = require('./xml-authorizer').authorize;
var pam = require('./pam-authorizer').authorize;

var selector = hardcoded;
swappable = function(username, password) {
	return selector(username, password);
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
});

exports.authorize = swappable;
