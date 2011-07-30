var path = require('path');
var fs = require('fs');

var defaults = require('./default');
var resolve = require('../persistence/file-resolve');
var ssiParser = require('../ssi/ssi-parser');
var ssi = require('../ssi/ssi-handler');


/**
 * Stream a named file to the response processing SSI includes.
 * 
 * This streams only from the /app directory defined by appjsdir
 * not from the document base.
 */
function doGet(request, response, url) {

	resolve.resolveApp(url.pathname, true, function(fileSystemPath) {

		// open the file
		var instream = fs.createReadStream(fileSystemPath , { flags: 'r' });
		
		instream.on('error', function() {
			// TODO this is not correct FNF should be detected some other way
			defaults.fileNotFound(response);
		});
		
		// set default HTTP headers
		response.statusCode = 200;
		var mime = defaults.mimeMagic(response, url.pathname);
		
		// 24hrs caching
		defaults.addCache1DayHeaders(response);
		
		// If it is HTML parse SSI 
		if (mime == "text/html") {
			
			// fixing what appears to be bugs in FF3
			defaults.addNoCacheHeaders(response);
			
			// set up SSI
			var parser = new ssiParser.Parser("Http Server" , instream, response, new ssi.SsiHandler());
		
			// exec
			parser.exec(function(message) {
				response.end();
			});
		}
		// otherwise stream the response asis
		else {
			instream.pipe(response);
		}
		
	});
};





exports.doGet = doGet;
