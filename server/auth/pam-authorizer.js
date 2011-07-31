//var pamlib = require('pam');
//var pam = new pamlib.PAM();

var service = "system-auth";

/**
 * Authorizer that uses Linux system users.
 * 
 * PAM module is broken on this version of node  :(
 * 
 * undefined symbol: ev_rt_now
 *
 */
exports.authorize = function(username, password) {
//	pam.authenticate(service, username, password, function(result) {
//		cb(result);  // not sure if this returns a boolean??
//	});
};

exports.authorize("teknopaul", "changeme");
