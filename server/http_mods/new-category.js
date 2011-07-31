var path = require('path');
var fs = require('fs');

var defaults = require('./default');
// Since we re using node.js lets share the validation routine with the frontend.
var pageNameValidator = require('../../client/app/js/page-name-validator');

var resolve = require('../persistence/file-resolve.js');

/**
 * Create a new folder/directory
 * 
 */
function doPost(request, response, url) {
	
	if (typeof url.query.path == 'undefined') {
		defaults.badRequest(response);
		return;
	}
	
	if ( ! request.authenticated ) {
		defaults.forbidden(response);
		return;
	}

	try {
		var path = url.query.path;
		path = pageNameValidator.validatePageName(path, false); // permit "/" char this specifies the root
		
		resolve.resolve(path, true, function(fileSystemPath) {
			fs.mkdir(fileSystemPath, 0777, function() {
				var respData = '{"ok":true}';
				response.writeHead(200, "OK", {
					"content-type" : "application/json", 
					"Content-length" : "" + respData.length
				});
				response.write(respData);
				response.end();						
			});
		});
	} 
	catch(err) {
		console.error("Error creating category : "+  url.query.path + " " + err);
		// should not get here since the browser uses the same validation, implies a hack
		response.writeHead(400);
		response.end();
	}
};


exports.doPost = doPost;

