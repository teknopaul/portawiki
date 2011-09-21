
var parse = require('url').parse;
var resolveObject = require('url').resolveObject;

/**
 * You can tell I come from a Java background this filter adds a map of attributes to the request.
 * 
 */
filter = function(request, response, chain) {
	
	request.attributes = {};
	var url = parse(request.url, true);
	url = resolveObject(url, url); // strange syntax (url passed twice) but this resolves ../../ paths in the URL
	request.attributes.url = url;
	
	chain.doFilter(request ,response);
	
};

exports.filter = filter;
