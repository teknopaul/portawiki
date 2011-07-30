
var parse = require('url').parse;

/**
 *  "Servlet" filter for adding the default headers
 */

filter = function(request, response, chain) {
	
	var url = parse(request.url);
	console.log(request.method + " " + url.pathname);
	
	chain.doFilter(request, response);
	
};

exports.filter = filter;