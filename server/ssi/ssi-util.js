
var ssiParser = require('../ssi/ssi-parser');
var ssi = require('../ssi/ssi-handler');

/**
 * Utility method for SSI.
 */

/**
 * Processes any SSI comments in the input stream and writes 
 * the response to the output stream then calls end() on the stream.
 */
processSsi = function(instream, response) {
	
	// set up SSI
	var handler = new ssi.SsiHandler();
	var parser = new ssiParser.Parser("SSI Util" , instream, response, handler);

	// exec
	parser.exec(function() {
		response.end();
	});
	
};

exports.processSsi = processSsi;
