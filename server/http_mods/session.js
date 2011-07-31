var parseQueryString = require('querystring').parse;

var defaults = require('./default.js');
var config = require("../util/config.js").configData;
var authorize = require("../auth/authorizer.js").authorize;
var m3auth = require("../auth/m3-auth.js");


/**
 * Mimicing Model3 sessionless auth.  
 * 
 * This module handles 
 * 	/session/aunthenticate
 * 	/session/secureCheck
 *  /session/logout
 */

// JSON responses
var AUTH_REQUIRED = {
	  m3_condition	: {
	    name	: "AUTH_REQUIRED",
	    code	: 1
	  }
};
var AUTH_FAILED = {
		  m3_condition	: {
		    name	: "AUTH_FAILED",
		    code	: 2
		  }
};
var M3_OK = { "m3_ok" :	true };
var M3_NOK = { "m3_ok" :	false };
/**
 * GET handles checking session state
 */
doGet = function(request, response, url) {
	
	defaults.addNoCacheHeaders(response);
	
	var respObject = { m3_string : null };
	
	if (url.pathname.indexOf("/session/checkSecure")) {
		if ( request.authenticated &&
			 request.session.cookieModel.authenticated ) {
			respObject = M3_OK;
		}
		else {
			respObject = AUTH_REQUIRED;
		}
	}
	else if (url.pathname.indexOf("/session/check")) {
		var name = "";
		if ( request.authenticated ) {
			name = request.session.cookieModel.data[0];
			respObject.m3_string = name;
		}
		else {
			respObject = AUTH_REQUIRED;
		}
	}
	
	sendJson(response, respObject);				
	
};

/**
 * POST handles logins
 */
doPost = function(request, response, url) {
	
	if (url.pathname.indexOf("/session/authenticate") == 0) {
		
		var buffer = '';
		
		request.on('data', function(data) {
			buffer += data;
		});
		
		request.on('end', function() {
			
			var tokens = parseQueryString(buffer);
			authorize(tokens.username, tokens.password, function(ok) {
			 	if (ok) {
					var cm = new m3auth.CookieModel();
					cm.athenticated = true;
					cm.data.push(tokens.username);
					
					var cookie = secureCookieData(config.key, cm);
					response.setHeader('Set-Cookie', 'M3=' + cookie + ";path=/");
					sendJson(response, M3_OK);
				}
				else {
					response.setHeader('Set-Cookie', 'M3=');
					sendJson(response, AUTH_FAILED);
				}
			});
			
		});
	}
	else {
		sendJson(response, M3_NOK);	
	}
	
};

sendJson = function(response, respObject) {
	var respJson = JSON.stringify(respObject);
	response.writeHead(200, "OK", {
		"Content-Type" : "application/json",
		"Content-Length" : "" + Buffer.byteLength(respJson, 'utf-8')
	});
	response.write(respJson);
	response.end();
};

exports.doGet = doGet;
exports.doPost = doPost;
