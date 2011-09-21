var assert = 	require('assert');
var nodeunit = 	require('nodeunit');
var format = require('url').format;
var parse = require('url').parse;
var resolve = require('url').resolve;
var resolveObject = require('url').resolveObject;
/**
 * nodeunit test cases
 */
module.exports.testObject = function(test) {
	console.log("-- testObject --");

	try {
		var url = parse('http://foo.com/a/b/../../file/?one=two');
		//console.dir(url);
	
		console.log("formatted : " + format(url));
	
		var ret = resolveObject(url, url);
		
		console.dir(ret);
	}
	catch(err) {
		console.log("caught exception : " + err);
		test.fail();
	}
	
	
	test.done();
};

module.exports.testString = function(test) {
	console.log("-- testString --");

	try {
		var url = parse('http://foo.com/a/b/../../file/?one=two');
		//console.dir(url);
	
		console.log("formatted : " + format(url));
	
		console.log("-- testString base URL provided --");
		var ret = resolve('http://foo.com/', 'http://foo.com/a/b/../../file/?one=two');
		console.dir(ret);
		
		console.log("-- testString base URL not provided --");
		var ret = resolve('http://bar.com/a', 'http://foo.com/a/b/../file/?one=two');
		console.dir(ret);
		
		
	}
	catch(err) {
		console.log("caught exception : " + err);
		test.fail();
	}
	
	
	test.done();
};
