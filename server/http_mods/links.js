var fs = require('fs');
var domjs = require('dom-js');


/**
 * TODO A module for maintaining an includable .html ssi page with a list of external links.
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
			if (fc.name == 'img') {
				linkModel.icon = fc.attributes['src'];
				if (linkElem.children.length > 1) {
					linkModel.title = linkElem.children[1].text; 
				}
			}
			else {
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
		sb += all[i].toXHTML();
		sb += '\n';
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
 * 
 * @param request
 * @param response
 * @param url
 */
function doPost(request, response, url) {
	
	
};

function doGet(request, response, url) {
	
};

// for nodeunit
module.exports.factory = factory;
module.exports.materialize = materialize;
module.exports.persist = persist;

// for web
module.exports.doGet = doGet;
module.exports.doPost = doPost;

