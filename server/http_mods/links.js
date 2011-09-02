var fs = require('fs');
var domjs = require('dom-js');
var config = require("../util/config.js").configData;


/**
 * TODO A module for maintaining an includable .html ssi page with a list of external links.
 * Not meant to be scalable, this just works with a single file for the main menu.
 * 
 */

/**
 * Data holder for a single link  
 * @constructor
 */
LinkModel = function(url, title, description, icon) {
	this.url = url; // URL escaped
	this.title = title; // unescaped text
	this.description = description;  // unescaped text
	this.icon = icon; // URL escaped
	this.renderer = this; // plugin some other object that implements toHref() 
};
/**
 * Convert one model to an XHMTL snippet (not a doc, no wrapping element).
 * @param model
 */
LinkModel.prototype.toXHTML = function(model) {
	var m = model || this;
	var href = '<a href="' + m.url + '" ';
	if (m.description) {
		href += 'title="' + domjs.escape(m.description) + '" ';
	}
	href += 'class="pw-link">';
	if (m.icon) {
		href += '<img src="' + m.icon + '" class="pw-link-icon"/>';
	}
	if (m.title) {
		href += domjs.escape(m.title);
	}
	href += '</a>';
	return href;
};

/**
 * Read an XHTML string and create an array of LinkModels
 * @param xmlString
 * @param cb callback when done
 */
LinkModel.unmarshall = function(xmlString, cb) {
	var docBuilder = new domjs.DomJS();
	docBuilder.parse(xmlString, function(err, dom) {
		if (err) {
			cb(err);
			return;
		}
		var all = [];
		for(var i = 0 ; i < dom.children.length ; i++) {
			if (typeof dom.children[i].text == 'string') {
				continue;
			}
			var linkElem = dom.children[i];
			
			var linkModel = new LinkModel();
			linkModel.url = linkElem.attributes['href'];
			linkModel.description = linkElem.attributes['title'];
			var fc = linkElem.firstChild();
			//console.log(fc);
			if (fc && fc.name && fc.name == 'img') {
				linkModel.icon = fc.attributes['src'];
				if (linkElem.children.length > 1) {
					linkModel.title = linkElem.children[1].text; 
				}
			}
			else {
				if ( ! linkElem.children[0].text ) {
					console.log('missing data in the XHTML');
					continue;
				}
				linkModel.title = linkElem.children[0].text; 
			}
			all.push(linkModel);
		}
		cb(false, all);
	});
};
/**
 * convert an array of LinkModels to an XHMTL string.
 * @param all
 * @returns {String}
 */
LinkModel.marshall = function(all) {
	var sb = '<div id="pw-links">\n';
	for ( var i = 0; i < all.length; i++) {
		if ( all[i] != null) {
			sb += all[i].toXHTML();
			sb += '\n';
		}
	}
	sb += '</div>\n';
	return sb;
};
/**
 * Construct a LinkModel from a JSON object with the correct attributes
 * @param json
 * @returns {LinkModel}
 */
factory = function(json) {
	return new LinkModel(json.url, json.title, json.description, json.icon);
};

/**
 * Save the data (overwrite)
 */
persist = function(fileName, all, cb) {
	// TODO atomic createfile
	fs.writeFile(fileName + '.tmp', LinkModel.marshall(all), function(err) {
		if ( ! err ) {
			fs.rename(fileName + '.tmp', fileName, cb);
		}
		else {
			cb(err);
		}
	});
};

materialize = function(fileName, cb) {
	fs.readFile(fileName, 'utf-8', function(err, data) {
		if ( ! err ) {
			LinkModel.unmarshall(data, cb);
		}
		else {
			cb(err);
		};
	});
};

/**
 * Get the data in JSON form for the edit form.
 * @param request
 * @param response
 * @param url
 */
function doGet(request, response, url) {
	
	var linksFile = config.appjsdir + "/main-links.html";
	
	materialize(linksFile, function(err, existingData) {
		if ( ! err ) {
			var json = JSON.stringify(existingData);
			response.writeHead(200, "OK");
			response.write(json);
			response.end();
			return;
		}
		else if ( err.errno == 2 ) {
			response.writeHead(200, "OK", { "Content-Length" : "2" });
			response.write("[]");
			response.end();
			return;
		}{
			console.log(err);
			response.writeHead(500, "SERVER ERROR");
			response.end();
			return;
		}
	});
	
};

function doPost(request, response, url) {
	
	var linksFile = config.appjsdir + "/main-links.html";
	
	materialize(linksFile, function(err, existingData) {
		
		if ( err.errno == 2) { // file not found
			console.log(linksFile + ' not found');
			existingData = [];
		}
		else if (err) {
			console.log("Error loading data : " +  url + " " + err);
			response.writeHead(400, "BAD REQUEST");
			response.end();
			return;
		}
		
		var buffer = '';
		var togo = null;
		if (url.query && url.query.del) {
			togo = url.query.del;
		}
		else {
			// load from POST request
			request.on('data', function(data) {
				buffer += data;
			});
		}
		
		// when all loaded
		request.on('end', function(){
			
			try {
				if (togo != null) { // deleting
					for ( var i = 0; i < existingData.length; i++) {
						if (existingData[i].url == togo) {
							existingData[i] = null;
						}
					}
				}
				else { // adding
					
					// check we got something
					if (buffer.length == 0) {
						console.log("Error saving links : "+  url + " " + err);
						response.writeHead(400, "BAD REQUEST");
						response.end();
						return;
					}

					// sync can throw
					var json = JSON.parse(buffer);
					
					// validation
					if ( ! json.url ) {
						throw new Error("url required in JSON object");
					}
					if ( json.url.indexOf("http") != 0 ) {
						throw new Error('url should start "http"');
					}
					if (typeof json.title == 'undefined' &&
						typeof json.icon == 'undefined'	) {
						throw new Error('need and icon or a title');
					}

					// create and add a model
					var model = factory(json);
					existingData.push(model);
				}
				
				// save changes
				persist(linksFile, existingData, function(err) {
					if ( ! err) {
						var ok = '{"ok": true}';
						response.writeHead(200, "OK", { "Content-Length" : "" + ok.length });
						response.write(ok);
						response.end();
						return;
					}
				});
				
				
			} catch (err) {
				console.log("Bad JSON : " +  url + " " + err);
				response.writeHead(400, "BAD REQUEST");
				response.end();
				return;
			}
		});

	});
	
};

// for nodeunit
module.exports.factory = factory;
module.exports.materialize = materialize;
module.exports.persist = persist;

// for web
module.exports.doGet = doGet;
module.exports.doPost = doPost;

