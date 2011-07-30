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
var source = 		require('../util/stream-source.js');

/**
 * Return the Table Of Contents as a fragment of HTML for AJAX requests.
 */
function doGet(request, response, url) {
	
	var pageName = url.pathname.substring("/toc".length);
	
	try {
		pageName = pageNameValidator.validatePageName(pageName, false); // permit "/" char this means something

		// create a directory listing
		var tc = new toc.ToC(pageName);
		tc.getHtml( function(tocHtml) {
			
			// TODO caching and flushing
			response.write(tocHtml);
			response.end();
			
		});
		
	} catch(err) {
		console.error("Error creating toc : " +  url.pathname + " " + err);
		// should not get here since the browser uses the same validation, implies a hack/bug
		response.writeHead(400, "OK");
		response.end();
	}
};

exports.doGet = doGet;
