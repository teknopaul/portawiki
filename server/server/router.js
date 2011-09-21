
var parse = require('url').parse;
var resolveObject = require('url').resolveObject;

var config = require('../util/config').configData;

var defaults = require('../http_mods/default');

var indexModule = 		require('../http_mods/index');
var appModule = 		require('../http_mods/app');
var viewModule = 		require('../http_mods/view');
var dirModule = 		require('../http_mods/dir');
var tocModule = 		require('../http_mods/toc');
var editModule =		require('../http_mods/edit');
var faviconModule =		require('../http_mods/favicon');

var newModule =			require('../http_mods/new');
var newCategoryModule =	require('../http_mods/new-category');
var saveModule = 		require('../http_mods/save');
var sessionModule = 	require('../http_mods/session');
var uploadModule = 		require('../http_mods/upload');


var linksModule = 		require('../http_mods/links');

/**
 * Router routes requests to the correct module.
 * It parses the URI and calls doGet or doPost of the modules.
 * TODO revers the roles modules should determine their own URI.
 */
route = function(request, response, chain) {
	try {
		
		var url = parse(request.url, true);
		url = resolveObject(url, url); // strange syntax (url passed twice) but this resolves ../../ paths in the URL
		
		if (url.pathname.indexOf('/session/') == 0) {
			service(sessionModule, request, response, url);
		}
		else if (url.pathname == '/') {
			service(indexModule, request, response, url);
		}
		else if (url.pathname.indexOf('/view/') == 0) {
			var len = url.pathname.length;
			if ( url.pathname.lastIndexOf('/') == (len - 1) ) {
				dirModule.doGet(request, response, url);
			}
			else {
				viewModule.doGet(request, response, url);
			}
		}
		else if (url.pathname.indexOf('/app/') == 0) {
			service(appModule, request, response, url);
		}
		else if (url.pathname.indexOf('/toc/') == 0) {
			service(tocModule, request, response, url);
		}
		else if (url.pathname.indexOf('/edit/') == 0) {
			service(editModule, request, response, url);
		}
		else if (url.pathname.indexOf('/favicon.png') == 0 ||  url.pathname.indexOf('/favicon.ico') == 0) {
			service(faviconModule, request, response, url);
		}
		else if (url.pathname.indexOf('/save/') == 0) {
			service(saveModule, request, response, url);
		}
		else if (url.pathname.indexOf('/new/') == 0) {
			service(newModule, request, response, url);
		}
		else if (url.pathname.indexOf('/new-category/') == 0) {
			service(newCategoryModule, request, response, url);
		}
		else if (url.pathname.indexOf('/upload/') == 0) {
			service(uploadModule, request, response, url);
		}
		else if (url.pathname.indexOf('/links/') == 0) {
			service(linksModule, request, response, url);
		}
		
		else if (request.method == 'GET') {
			defaults.fileNotFound(response);
		}
		else {
			defaults.badRequest(response);
		}
	}
	catch (err) {
		console.dir(err);
		console.log("Router error: " + err);
	}
	
	chain.doFilter(request, response);
	
};

/**
 * select doGet or doPost for modules that might handle both
 */
service = function(module, request, response, url) {
	if (request.method == 'GET') {
		module.doGet(request, response, url);
	}
	else if (request.method == 'POST') {
		module.doPost(request, response, url);
	}
};

exports.route = route;
exports.filter = route;
