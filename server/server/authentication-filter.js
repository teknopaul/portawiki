
var util = require("../util/util.js");
var config = require("../util/config.js").configData;
var m3auth = require("../auth/m3-auth.js");

/**
 *  Model3 compatible security filter
 */
filter = function(request, response, chain) {
	
	if (request.attributes.url.pathname.indexOf("/app/") != 0) {
		try {
			var cookie = util.parseCookie(request.headers.cookie);
			if (cookie.m3) {
				var cookieModel = m3auth.validateCookieString(config.key, cookie.m3, 10000000, true);
				request.session = {
						cookieModel : cookieModel
				};
				console.log("authenticated:" + cookieModel.data[0]);
			}	
		} catch(err) {
			console.log("Auth error " + err);
		}
	}
	
	chain.doFilter(request, response);
	
};

exports.filter = filter;

