var path = require('path');
var fs = require('fs');

var config = require('../util/config').configData;

/**
 * Resolve a path name, returns an absolute path to the file or null.
 */
resolve = function(pathname, forweb, callback) {
	_resolve(pathname, forweb, callback);
};

/**
 * @private does the resolving.
 */
_resolve = function(pathname, forweb, callback) {

	//console.log("Resolving " + pathname);
	
	// get the real file's path avoiding ../ trickery
	pathname = path.normalize(pathname);
	if (pathname.indexOf('..') >= 0) {
		throw {error : "../ trickery"};
	}
	
	if (pathname.charAt(0) != '/') {
		pathname = '/' + pathname;
	}
	
	// get base
	var basedir = config.basedir;

	// get path in the filesystem
	var fileSystemPath = path.normalize(basedir + pathname);
	
	// TODO check for base validity
	callback(fileSystemPath);
};

/**
 * TODO forweb flag indicates useage is to stream to the Internet, in the future we may
 * have data in /app that is not to be sent but for example contains XML that serverside
 * may need to process.
 */
resolveApp = function(pathname, forweb, callback) {

	// get the real file's path avoiding ../ trickery
	pathname = path.normalize(pathname);
	if (pathname.indexOf('..') >= 0) {
		throw new Error("../ trickery");
	}
	
	// get base
	if (pathname.indexOf('/app/') == 0) {
		basedir = config.appjsdir;
		pathname = pathname.substring("/app".length);
	}
	else {
		console.log("Resolving missing base path " + pathname);
		throw  new Error("Error resolving");
	}
	
	// get path in the filesystem
	var fileSystemPath = path.normalize(basedir + pathname);
	
	// TODO check for base validity
	callback(fileSystemPath);
};

resolveData = function(pathname, forweb, callback) {

	// get the real file's path avoiding ../ trickery
	pathname = path.normalize(pathname);
	if (pathname.indexOf('..') >= 0) {
		throw new Error("../ trickery");
	}
	
	// get base
	if (pathname.indexOf('/data/') == 0) {
		basedir = config.datadir;
		pathname = pathname.substring("/data".length);
	}
	else {
		console.log("Resolving missing base path " + pathname);
		throw new Error("Error resolving");
	}
	
	// get path in the filesystem
	var fileSystemPath = path.normalize(basedir + pathname);
	
	// TODO check for base validity
	callback(fileSystemPath);
};
/**
 * take a full URL and return the page title
 */
getPageTitle = function(fileName) {
	return filename(fileName, false).replace(/_/g, ' '); 
};


// TODO where is this used I think node,js has nbative implementations of these two

filename = function(fileName, incExt) {
	var start = fileName.lastIndexOf('/');
	if (start < 0) {
		start = 0;
	} else {
		start++;
	}
	var end = fileName.lastIndexOf('.');
	if (end < 0 || incExt) {
		end = fileName.length;
	}
	return fileName.substring(start, end); 
};

/**
 * take a full URL and return the relative path component.
 */
dirname = function(fileName) {
	var end = fileName.lastIndexOf('/');
	if (end <= 0) {
		return "";
	}
	if (fileName.charAt(0) == '/') {
		return fileName.substring(1, end);
	}
	else {
		return fileName.substring(0, end);
	}
};

exports.resolve = resolve;
exports.resolveApp = resolveApp;
exports.resolveData = resolveData;
exports.getPageTitle = getPageTitle;
exports.dirname = dirname;
exports.filename = filename;
