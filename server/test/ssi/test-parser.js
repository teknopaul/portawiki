var assert = 	require('assert');
var nodeunit = 	require('nodeunit');
var fs = require('fs');
var ssi = require("../../ssi/ssi-handler.js");
var ssiParser = require("../../ssi/ssi-parser.js");
var mocks = require("../mocks.js");


/**
 * nodeunit test case for SSI parser
 */
processSsi = function(instream, response) {
	
	// set up SSI
	var handler = new ssi.SsiHandler({});
	var parser = new ssiParser.Parser("SSI Util" , instream, response, handler);

	// exec
	parser.exec(function() {
		response.end();
	});
	
};

module.exports.test = function(test) {

	var instream = fs.createReadStream("./outer.shtml", { flags: 'r', encoding: 'utf8', start: 0 });
	var response = new mocks.response();
	response.end = function() {
		test.ok(response.streamed.indexOf("outer start") > -1);
		test.ok(response.streamed.indexOf("inner text") > -1);
		test.ok(response.streamed.indexOf("outer end") > -1);
		test.equal(response.streamed.length, 93);
		test.done();
	};
	
	test.doesNotThrow(
		function() {
			processSsi(instream, response);
		}
	);
	
};
