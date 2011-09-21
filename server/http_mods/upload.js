var fs = require('fs');

var formidable = require('formidable');

var pageNameValidator = require('../../client/app/js/page-name-validator');
var resolve = require('../persistence/file-resolve');
var defaults = require('./default');
/**
 * File uploads
 * @param request
 * @param response
 * @param url
 */
function doPost(request, response, url) {
	
	if ( ! request.authenticated ) {
		defaults.forbidden(response);
		return;
	}
	
	//parse a file upload
	var form = new formidable.IncomingForm();
	form.uploadDir = '../tmp';
	form.parse(request, function(err, fields, files) {
		if (err) {
			response.writeHead(200, {'content-type': 'text/plain'});
			response.write('Upload failed\n\n');
			response.end();
			return;
		}
		try {
			var dir = fields.dir0;
			var newName = fields.fileName0;
			var newExt = fields.fileExt0;
			if (typeof newExt == 'undefined') {
				return; // impolite but fields are missing!
			}
			if (typeof newName == 'undefined') {
				return; // impolite but fields are missing!
			}
			if (typeof dir == 'undefined') {
				return; // impolite but fields are missing!
			}
			dir = 		pageNameValidator.validatePageName(dir, false);
			newName = 	pageNameValidator.validatePageName(newName, true);
			newExt =	pageNameValidator.validatePageName(newExt, true);
			
			resolve.resolve(dir + "/" +  newName + "." + newExt, true, function(fileSystemFile) {
				fs.rename(files.file0.path, fileSystemFile, function(err) {
					if (err) {
						console.log(err);
						response.writeHead(200, {'content-type': 'text/plain'});
						response.write('Upload failed\n\n');
						response.end();
					}
					else {
						response.writeHead(200, {'content-type': 'text/plain'});
						response.write('Received upload\n\n');
						response.end();
					}
				});
			});

		} catch(err) {
			console.log(err);
			// if file name validation fails it was a freaked Stream anyway validate the name in JS before sending
			response.writeHead(200, {'content-type': 'text/plain'});
			response.write('Upload failed\n\n');
			response.end();
		}
	});

}

exports.doPost = doPost;
