var path = require('path');
var fs = require('fs');

var defaults = 	require('./default');
var resolve = 	require('../persistence/file-resolve');
var config = 	require('../util/config.js').configData;
var pageNameValidator = require('../../client/app/js/page-name-validator');
/**
 * This is a simple JSON REST service that allows reading and writing using AJAX requests.
 * 
 * The path must have a context root of /data/, but after that any path is valid, and any item name follows the same rules as page names.
 * 
 * e.g.  POST /data/user/Teknopaul  with overwrite the data in a file called Teknopaul.json provided the JSON supplied 
 * complies to the template /data/user/dir.template.json  (dir.tempalte is used as a filename since . is not permitted in a page name)   
 * 
 * The only methods supported are GET and POST and it up to the front end to do something sensible with the data.
 * 
 * For security this system only allows structured
 * JSON objects to be stored.  Since we don't have the luxury of XSDs in JSON the system uses a simple templating system.
 * 
 * A tempalte is a file called /foo/bar/dir.template.json
 * When saving the data, only the attributes from the JSON that match the attributes in the template will be stored.
 * The name and datatype must match,  only data types boolean string and number are supported.
 * 
 * e.g. template
 * 
 * {
 *   name : '',
 *   age: 0,
 *   isDev : true
 * }
 * 
 */


/**
 * Get the JSON file or if a directory is supplied list the json files.
 */
doGet = function(request, response, url) {
	
	try {
		pageNameValidator.validatePageName(url.pathname, false);
	} catch(err) {
		console.log("name not valid " + url.pathname);
		defaults.fileNotFound(response);
		return;
	}
	
	// get the real file's path avoiding ../ trickery
	
	resolve.resolveData(url.pathname, true, function(fileSystemPath) {
		fs.stat(fileSystemPath, function(err, stat) {
			if (err) {
				defaults.fileNotFound(response);
				return;
			}
			if (stat.isDirectory()) {
				fs.readdir(fileSystemPath, function(err, files) {
					if (err) {
						defaults.fileNotFound(response);
						return;
					}
					var json = {
							items : new Array()
					};
					for(var i = 0 ; i < files.length; i++) {
						var fileName= files[i];
						if ( fileName.indexOf('.') == 0 ) {
							continue;
						}
						if ( fileName.indexOf('.json') == fileName.length - '.json'.length ) {
							var jsonName = fileName.substring(0, fileName.length - '.json'.length);
							if (jsonName.indexOf('.') == -1) {
								json.items.push(jsonName);
							}
						}
					}
					defaults.addNoCacheHeaders(response);
					response.setHeader("Content-Type", "application/json");
					response.write(JSON.stringify(json));
					response.end();
				});
			}
			else {
				fs.readFile(fileSystemPath + '.json', 'utf-8', function(err, data) {
					if (err) {
						defaults.fileNotFound(response);
						return;
					}
					defaults.addNoCacheHeaders(response);
					response.setHeader("Content-Type", "application/json");
					response.write(data);
					response.end();
				});
			}
		});
	});
	
};

doPost = function(request, response, url) {
	
	try {
		var pageName = pageNameValidator.validatePageName(url.pathname, false);
	} catch (e) {
		defaults.fileNotFound(response);
		return;
	}
	
	// get the real file's path avoiding ../ trickery
	resolve.resolveData(pageName, true, function(fileSystemPath) {
		var dirname = path.dirname(fileSystemPath);
		var template = path.resolve(dirname, 'dir.template.json');
		fs.readFile(template, 'utf-8', function(err, templateData) {
			if (err) {
				console.log("Template not found: " + template);
				defaults.fileNotFound(response);
				return;
			}
			var buffer = '';
			
			request.on('data', function(data) {
				buffer += data;
			});
			
			request.on('end', function() {
				
				var safeBean = copyBean(JSON.parse(templateData), JSON.parse(buffer));

				fs.writeFile(fileSystemPath + '.json', JSON.stringify(safeBean, null, '\t'), 'utf-8', function(err, data) {
					if (err) {
						defaults.fileNotFound(response);
						return;
					}
					defaults.addNoCacheHeaders(response);
					response.setHeader("Content-Type", "application/json");
					response.write('{"ok" : true}');
					response.end();
				});
			});

		});
		
	});
	
};
/**
 * @return a copy of input, but only copying the attributes that match in name and datatype in the template
 */
copyBean = function(template, input) {
	var copy = {};
	for(attr in template) {
		
		var value = input[attr];
		
		if (typeof value == 'undefined') {
			continue;
		}
		
		if (typeof template[attr] == 'string' && typeof value == 'string') {
			copy[attr] = value;
		}
		else if (typeof template[attr] == 'number' && typeof value == 'number') {
			copy[attr] = value;
		}
		else if (typeof template[attr] == 'boolean' && typeof value == 'boolean') {
			copy[attr] = value;
		}
		else {
			console.log('object not supported ' + value);
		}
	}
	return copy;
};

/**
 * Find the template for this directory.
 */
resolveTemplate = function(base, pathname) {
	while (pathname.indexOf('/') == 0) {
		pathname = pathname.substring(1);
	}
	return path.resolve(base, pathname, 'dir.template.json');
};

exports.resolveTemplate = resolveTemplate;
exports.copyBean = copyBean;
exports.doGet = doGet;
exports.doPost = doPost;
