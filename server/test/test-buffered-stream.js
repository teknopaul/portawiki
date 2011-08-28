var assert = 	require('assert');
var nodeunit = 	require('nodeunit');

var BufferedStream = require('../util/buffered-stream').BufferedStream;

/**
 * nodeunit test cases
 */
module.exports.test = function(test) {

	var BUF_LEN = 20;
	var endCalled = false;
	var expectWrite = false;
	var totalData = '';
	
	var buff = new BufferedStream({
		
		write : function(data) {
			if ( ! expectWrite ) {
				test.ok(false);
			}
			totalData += data;
			console.log(data);
		},
		
		end : function() {
			endCalled = true;
			console.log('end');
		}
		
	}, BUF_LEN);
	
	expectWrite = false;
	buff.write("0123456789");
	buff.write("0123456789");
	expectWrite = true;
	buff.write("0123456789");
	buff.end();
	
	test.ok(endCalled);
	test.equals(totalData, "012345678901234567890123456789");
	
	test.done();
	
};
