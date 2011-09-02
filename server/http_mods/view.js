var path = require('path');
var fs = require('fs');

var defaults = require('./default');
var resolve = require('../persistence/file-resolve');
var ssiParser = require('../ssi/ssi-parser');
var ssi = require('../ssi/ssi-handler');

/**
 * Stream a named file to the response processing SSI includes.
 * 
 * TODO get system time and print out how long processing takes.
 */
function doGet(request, response, url) {

	var pathname = url.pathname.substring("/view".length);
	
	// get the real file's path avoiding ../ trickery
	resolve.resolve(pathname, true, function(fileSystemPath) {
	
		//console.log("Fetching file: " + fileSystemPath);

		// set default HTTP headers
		response.statusCode = 200;
		var mime = defaults.mimeMagic(response, url.pathname);

		// TODO test this
		//if (request.connection.destroyed) return;

		// open the file
		var instream = null;
		if ( defaults.mimeMagicIsText(url.pathname) ) {
			instream = fs.createReadStream(fileSystemPath, { flags: 'r', encoding: 'utf8', start: 0 });
		} else {
			instream = fs.createReadStream(fileSystemPath, { flags: 'r', start: 0}) ;
		}
		
		//console.dir(instream);
		instream.on('error', function() {
			console.log("Errror reading file in view module " + url.pathname);
			// TODO this is not correct FNF should be detected some other way
			defaults.fileNotFound(response);
			return;
		});

		// TODO apparently this prevents FD leaks
		//request.on('close', function() {
		//	instream.destroy();
		//});
	
		// If it is HTML parse SSI 
		if (mime == "text/html") {
			
			response.setHeader("Content-Type", "text/html;charset=utf-8");
			
			// set up SSI
			var handler = new ssi.SsiHandler();
			var parser = new ssiParser.Parser("Http Server" , instream, response, handler);
		
			// exec
			parser.exec(function(message) {
				response.end();
			});
		}
		
		// otherwise stream the response as is.
		else {
			instream.pipe(response);
		}
		
	});
	
};

exports.doGet = doGet;
