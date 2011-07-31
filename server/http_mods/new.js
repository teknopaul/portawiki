var path = require('path');
var fs = require('fs');

var defaults = require('./default');
// Since we re using node.js lets share the validation routine with the frontend.
var pageNameValidator = require('../../client/app/js/page-name-validator');

var config = require('../util/config.js').configData;
var resolve = require('../persistence/file-resolve.js');
var replaceParser = require('../util/replace-parser.js');

/**
 * Create a new page , validating that the format is acceptable.
 * Since we re using node.js lets share the validation routine with the frontend.
 * 
 */
function doPost(request, response, url) {
	
	if (typeof url.query.pageName == 'undefined') {
		defaults.badRequest(response);
		return;
	}
	
	if ( ! request.authenticated ) {
		defaults.forbidden(response);
		return;
	}

	var user = request.session.cookieModel.data[0];
	
	var pageName = url.query.pageName;
	
	try {
		pageName = pageNameValidator.validatePageName(pageName, false); // permit "/" char this means something
		var title = resolve.getPageTitle(pageName); 
		resolve.resolve(pageName, true, function(fileSystemFile) {
			try {
				var respData = '{"ok":true}';
				var instream  = fs.createReadStream('./resources/template-file.html', { flags: 'r', encoding: 'utf8', start: 0 });
				var outstream = fs.createWriteStream(fileSystemFile + ".html", { flags: 'w', encoding: 'utf8', start: 0 });
				var env = {
					title : title, 
					metadata : '<div class="pw-created">' + user + '<span class="pw-date">' + new Date() + '</span></div>',
					content : '...'
				}
				var parser = new replaceParser.Parser("New", instream, outstream, env);
				parser.exec(function() {
					response.writeHead(200, "OK", {
						"Content-Type" : "application/json",
						"Content-Length" : "" + respData.length});
					response.write(respData);
					response.end();						
				}); 
			}
			catch(err) {
				console.error("Error creating page : "+  url.query.pageName + " " + err);
			}
		});
	} catch(err) {
		console.error("Error creating page : "+  url.query.pageName + " " + err);
		// should not get here since the browser uses the same validation, implies a hack
		response.writeHead(400, "OK");
		response.end();
	}
};


exports.doPost = doPost;

