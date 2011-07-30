var path = require('path');
var fs = require('fs');

var defaults = require('./default');

/**
 * Stream the favicon.ico
 */
function doGet(request, response, url) {
	
	var instream = fs.createReadStream("./resources/favicon.png" , { flags: 'r', bufferSize: 2 * 1024 });

	// set default HTTP headers
	response.statusCode = 200;
	response.setHeader("Content-Type", "image/png");
	response.setHeader("Cache-Control", "public");
	
	// 24hrs caching
	defaults.addCache1DayHeaders(response);
	
	// TODO should not chunk
	instream.pipe(response);
	
};





exports.doGet = doGet;
