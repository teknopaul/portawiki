
var parse = require('url').parse;

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
var sessionModule = 		require('../http_mods/session');
var restModule = 		require('../http_mods/rest'); // TODO
//var attachsModule = require('../http_mods/attach');
//var loginModule = 		require('../http_mods/login');
//var logoutModule = 		require('../http_mods/logout');

/**
 * Router routes requests to the correct module.
 * It parses the URI and calls doGet or doPost of the modules.
 * TODO revers the roles modules should determine their own URI.
 */
route = function(request, response, chain) {
	try {
		
		var url = parse(request.url, true);
		
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
		else if (url.pathname.indexOf('/attach/') == 0) {
			//service(attachModule, request, response, url);
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
