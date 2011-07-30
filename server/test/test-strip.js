
var fs = require('fs');
var stripParser = require('../strip-parser');

var instream = fs.createReadStream('../resources/example.shtml');

var out = process.stdout;

var instance = new stripParser.Parser("Outer" , instream, out);

instance.exec(function(message) {
	console.log("DONE " + message);
});

