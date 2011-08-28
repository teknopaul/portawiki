
var EventEmitter = require("events").EventEmitter;

var callback = require("./node-closure").callback;
/**
 * Constructor, for a pipe that accepts data in and emits it back out.
 * Uses only strings and += operator for the buffer and when paused will infinitly grow.
 */
function BufferedPipe(limit) {
	this.emitter = new EventEmitter();
	this.paused = false;
	this.loops = 0;
	this.limit = limit || 4096;
	this.buffer = '';
}

/**
 * Override the write() method to buffer the data
 */
BufferedPipe.prototype.write = function (string) {
	this.buffer += string;
    if ( ! this.paused && this.buffer.length > this.limit) {
    	this.emitter.emit('data', this.buffer);
    	this.buffer = '';
    }
};

BufferedPipe.prototype.flush = function () {
	if ( ! this.paused && this.buffer.length > 0) {
		this.emitter.emit('data', this.buffer);
		this.buffer = '';
	} else {
		this.buffer = '';
	}
};

BufferedPipe.prototype.pause = function () {
	//console.log("paused");
	this.paused = true;
};
BufferedPipe.prototype.resume = function () {
	//console.log("resume");
	this.paused = false;
}
BufferedPipe.prototype.timeout = function () {
	//console.log("timeout");
	this.emitter.emit('error', timeout);
	this.buffer = '';
	this.emitter.emit('end');
};

BufferedPipe.prototype.end = function () {
	//console.log("end " + this.paused + " buflen = " + this.buffer.length);
	if ( ! this.paused && this.buffer.length > 0) {
		this.emitter.emit('data', this.buffer);
		this.buffer = '';
		this.emitter.emit('end');
	}
	else {
		// paused try again next time (how do we prevent infinite loops here)
		if ( this.loops++ < 1000000) {  // presumably inifinite loops are cheap in node.js
			console.log("tick");
			process.nextTick(callback(this, this.end));			
		} else {
			console.log("tock");
			setTimeout(callback(this, this.timeout), 2000);
		};
	}
};

BufferedPipe.prototype.setEncoding = function(utf8) {
	if ('utf8' != utf8) {
		throw new Error("Only Strings are supported");
	}
};

BufferedPipe.prototype.on = function(evt, callback) {
	this.emitter.on(evt, callback);
};

exports.BufferedPipe = BufferedPipe;
