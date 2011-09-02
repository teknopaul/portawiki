var path = require('path');
var fs = require('fs');

var defaults = require('./default');
// Since we re using node.js lets share the validation routine with the frontend.
var pageNameValidator = require('../../client/app/js/page-name-validator');

var config = require('../util/config.js').configData;
var resolve = require('../persistence/file-resolve.js');
var metaData = require('../persistence/file-metadata.js');
var replaceParser = require('../util/replace-parser.js');


/**
 * Save the changes sent from the front end's edit page.
 * 
 * We need to load the page, save the meta data to memory.
 * load the template.html
 * save the page backout but injecting the content.
 */
function doPost(request, response, url) {
	
	if ( ! request.authenticated ) {
		defaults.forbidden(response);
		return;
	}

	var user = request.session.cookieModel.data[0];
	
	var buffer = '';
	var pageName = url.pathname.substring("/save".length, url.pathname.length - 5);// strip .html
	
	try {
		
		pageName = pageNameValidator.validatePageName(pageName, false); // permit "/" char this means something
		var title = resolve.getPageTitle(url.pathname);
		
		resolve.resolve(pageName, true, function(fileSystemFile) {
			
			request.on('data', function(data) {
				buffer += data;
			});

			request.on('end', function() {
				
				if (buffer.length == 0) {
					console.error("Error saving page : "+  url.query.pageName + " " + err);
					response.writeHead(400, "BAD REQUEST");
					response.end();
					return;
				}
				
				meta = new metaData.MetaData();
				meta.load(fileSystemFile + ".html", function() {
					
					meta.editors.push(new metaData.Editor(user, new Date()));
					var respData = '{"saved":true}';
					var env = {
							title : title, 
							metadata : meta.toXml(),
							content : buffer
						};
					
					fs.rename(fileSystemFile + ".html", fileSystemFile + ".html.bak", function(err) {
						var instream  = fs.createReadStream('./resources/template-file.html', { flags: 'r', encoding: 'utf8', start: 0 });
						var outstream = fs.createWriteStream(fileSystemFile + ".html", { flags: 'w', encoding: 'utf8', start: 0 });
						var parser = new replaceParser.Parser("Save", instream, outstream, env);
						parser.exec(function() {
							response.writeHead(200, "OK", {
								"Content-Type" : "application/json",
								"Content-Length" : "" + respData.length});
							response.write(respData);
							response.end();						
						}); 
						
					}); // end rename
									
				});  // end load meta

			}); // end request buffered
			
		}); // end resolve
		
	} catch(err) {
		console.error("Error saving page : "+  url.query.pageName + " " + err);
		response.writeHead(500, "SERVER ERROR");
		response.end();
	}
};


exports.doPost = doPost;

