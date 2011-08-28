var assert = 	require('assert');
var nodeunit = 	require('nodeunit');

/**
 * This test shows that native += operator on a String is much faster than a node Buffer
 */
/**
 * @constructor
 */
function StringBuffer(preallocate) {
	this.byteLength = 0;
	this.buffer = new Buffer(preallocate);
};

StringBuffer.prototype.append = function (string) {
	var lenNeeded = Buffer.byteLength(string) + this.byteLength;
	if ( lenNeeded > this.buffer.length ) {
		// reallocate
		var newLen = this.buffer.length * 2 > lenNeeded ? this.buffer.length * 2 : lenNeeded; 
		var newBuffer = new Buffer(newLen);
		this.buffer.copy(newBuffer, 0, 0, this.byteLength);
		this.byteLength += newBuffer.write(string, this.byteLength, 'utf-8');
		this.buffer = newBuffer;
	}
	else {
		// append
		this.byteLength += this.buffer.write(string, this.byteLength, 'utf-8');
	}
};

StringBuffer.prototype.toString = function () {
	return this.buffer.toString('utf-8', 0 , this.byteLength);
};


/**
 * nodeunit test cases
 */
module.exports.test = function(test) {

	var loops = 100000;
	console.time("string concat");
	var buf = '';
	for (var i = 0 ; i < loops ; i++) {
		buf += "@";
	}
	test.equals(loops, buf.length);
	console.timeEnd('string concat');
	
	console.time("string buffer");
	var buf = new StringBuffer(100001);
	for (var i = 0 ; i < 100000 ; i++) {
		buf.append("@");
	}
	test.equals(loops, buf.toString().length);
	console.timeEnd('string buffer');
	
	
	test.done();
	
};
