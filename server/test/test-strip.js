
var fs = require('fs');
var stripParser = require('../persistence/strip-parser');



exports.test = function(test) {
	var instream = fs.createReadStream('../resources/example.shtml');
	
	var out = process.stdout;
	
	var instance = new stripParser.Parser("Outer" , instream, out);
	
	instance.exec(function(message) {
		console.log("DONE " + message);
		test.done();
	});
	
};