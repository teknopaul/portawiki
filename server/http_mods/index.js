var path = require('path');
var fs = require('fs');

var defaults = require('./default');
var config = require('../util/config.js').configData;

/**
 * Stream the index.html file verbatim to the response.
 */
function doGet(request, response, url) {
	
	var basedir = config.basedir;
	
	var fileSystemPath = path.normalize(basedir + "/index.html");

	fs.stat(fileSystemPath, function(err, stat) {
		if (err) {
			console.log("FileNotFound looking for " + fileSystemPath + " create an index!");
			defaults.fileNotFound(response);
			return;
		}
		if (stat.isFile()) {
			var instream = fs.createReadStream(fileSystemPath , { flags: 'r' });
			instream.on('error', function() {
				defaults.fileNotFound(response);
			});
			// set default HTTP headers
			response.statusCode = 200;
			defaults.mimeMagic(response, 'index.html');

			instream.pipe(response);
		}
	});
	
};





exports.doGet = doGet;
