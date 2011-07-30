var path = require('path');
var fs = require('fs');

var defaults = require('./default');
var resolve = require('../persistence/file-resolve');
var stripParser = require('../persistence/strip-parser');

/**
 * Stream the central contents of a named HTML file
 */
function doGet(request, response, url) {

	var pathname = url.pathname.substring("/edit".length);
	
	// get the real file's path avoiding ../ trickery
	resolve.resolve(pathname, true, function(fileSystemPath) {
	
		//console.log("Fetching file: " + fileSystemPath);
		
		// use mimeMagic to ensure we are bing asked for HTML
		var mime = defaults.mimeMagic(response, pathname);
		if (mime != 'text/html' ) {
			defaults.badRequest(response);
			return;
		}
		// return text/plain since this is not a full HTML doc
		response.setHeader("Content-type", "text/plain");
		defaults.addNoCacheHeaders(response);
		
		// open the file
		var instream = fs.createReadStream(fileSystemPath, { flags: 'r', encoding: 'utf8', start: 0	});
		instream.on('error', function() {
			console.log("Errror reading file in view module");
		});
		
		// set default HTTP headers
		response.statusCode = 200;
		
		var instance = new stripParser.Parser("Outer" , instream, response);

		instance.exec(function(message) {
			response.end();
		});

	});
	
};

exports.doGet = doGet;
