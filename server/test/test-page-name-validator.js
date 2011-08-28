var assert = 	require('assert');
var nodeunit = 	require('nodeunit');

var pw = 	require('../../client/app/js/page-name-validator.js');

/**
 * nodeunit test cases, TODO asserts
 */
module.exports.test = function(test) {

	console.log("name : '" + pw.validatePageName("Hello World", true) + "'");
	console.log("name : '" + pw.validatePageName("Hello_World", true) + "'");
	console.log("name : '" + pw.validatePageName(" Hello World ", true) + "'");
	console.log("name : '" + pw.validatePageName("Hello+World", true) + "'");
	console.log("name : '" + pw.validatePageName("Goodbye Cruel World", true) + "'");
	console.log("name : '" + pw.validatePageName("Hello World", true) + "'");
	console.log("name : '" + pw.validatePageName("Hello World", true) + "'");
	try  {
		console.log("name : '" + pw.validatePageName("lets/../hack", true) + "'");
	}catch(err) {
		console.log(err);
	}
	try  {
		console.log("name : '" + pw.validatePageName("lets*", true) + "'");
	}catch(err) {
		console.log(err);
	}
	try  {
		console.log("name : '" + pw.validatePageName("lets.html", true) + "'");
	}catch(err) {
		console.log(err);
	}
	try  {
		console.log("name : '" + pw.validatePageName("/lets.html", false) + "'");
	}catch(err) {
		console.log(err);
	}
	try  {
		console.log("name : '" + pw.validatePageName("/lets.html", true) + "'");
	}catch(err) {
		console.log(err);
	}


	
	test.done();
	
};
