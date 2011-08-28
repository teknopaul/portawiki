var path = require('path');
var fs = require('fs');

var defaults = require('./default');
var config = require('../util/config.js').configData;

/**
 * redirect to /view/
 */
function doGet(request, response, url) {
	
	defaults.found(response, '/view/');
	
};

exports.doGet = doGet;
