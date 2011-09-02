var path = 	require('path');
var fs = 	require('fs');
var util =  require('util');

var defaults = require('./default');
// Since we re using node.js lets share the validation routine with the frontend.
var pageNameValidator = require('../../client/app/js/page-name-validator');

var config = 		require('../util/config.js').configData;
var toc = 			require('../persistence/toc.js');
var resolve = 		require('../persistence/file-resolve.js');
var replaceParser = require('../util/replace-parser.js');
var ssi = 			require('../ssi/ssi-handler.js');
var ssiParser = 	require('../ssi/ssi-parser.js');
var ssiUtil = 		require('../ssi/ssi-util.js');
var pipe = 			require('../util/buffered-pipe.js');
var pwUtil = 		require('../util/util.js');

/**
 * Dir shows the directory contents of index.html if there is one.
 * To force viewing the list of files add ?view=toc
 * 
 */
function doGet(request, response, url) {
	
	var pageName = url.pathname.substring("/view".length);
	
	try {
		pageName = pageNameValidator.validatePageName(pageName, false); // permit "/" char this means something
		
		var title = null;
		if (pageName.length > 1) {
			title = resolve.filename(pageName.substring(0, pageName.length - 1));
		} else {
			title = "root";
		}
		
		if (url.search == '?view=toc') {
			directoryListing(pageName, title, request, response);
			return;
		}
		
		resolve.resolve(pageName + '/index.html', true , function(fileSystemFile) {
			fs.stat(fileSystemFile, function(err, stat) {
				if ( ! err) {
					// index.html exists , use it
					defaults.found(response, pwUtil.removeDoubleSlash('/view/' + pageName + '/index.html'));
					return;
				}
				else {
					directoryListing(pageName, title, request, response);
				}
			});
			
		});
		
	} catch(err) {
		console.error("Error creating toc : " +  url.pathname + " " + err);
		// should not get here since the browser uses the same validation, implies a hack
		response.writeHead(400, "OK");
		response.end();
	}
};

directoryListing = function(pageName, title, request, response) {
	
	// create a directory listing
	var tc = new toc.ToC(pageName);
	
	tc.getHtml( function(tocHtml) {
		
		// TODO test this
		//if (request.connection.destroyed) return;
		
		var instream  = fs.createReadStream('./resources/template-dir.html', { flags: 'r', encoding: 'utf8', start: 0 });
		
		// TODO test this
		//request.on('close', function() {
		//	reader.destroy();
		//});

		
		var inoutpipe = new pipe.BufferedPipe();
		var env = {
			title : title.replace(/_/g, ' '), 
			metadata : '',
			content : tocHtml
		};
		response.setHeader("Content-Type", "text/html;charset=utf8");
		var rparser = new replaceParser.Parser("Dir Replace", instream, inoutpipe, env);

		ssiUtil.processSsi(inoutpipe, response);

		rparser.exec(function(message) {
			inoutpipe.end();
		});
	});
	
};

exports.doGet = doGet;
