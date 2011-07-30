
var fs = require('fs');
var ssiParser = require('../ssi/ssi-parser');
var ssi = require('../ssi/ssi-handler');

var instream = fs.createReadStream('../resources/example.shtml');

var out = process.stdout;

/*
var SsiHandler = function() {
	this.match = function(parser, ssiStatement, outstream) {
		console.log('Encountered ' + ssiStatement);
		outstream.write("INJECTED WITH A POISON");
	};
};
*/

var instance = new ssiParser.Parser("Outer" , instream, out, new ssi.SsiHandler());

instance.exec(function(message) {
	console.log("DONE " + message);
	//console.dir(instream);
	//fs.close(instream.fd); // this throws errors presumably stream is auto-closed somehow
	
	var instream2 = fs.createReadStream('../resources/example.shtml');
	var instance2 = new ssiParser.Parser("Outer 2" , instream2, out, new ssi.SsiHandler());
	
	instance2.exec(function(message) {
		console.log("DONE too " + message);
	});
	
});

