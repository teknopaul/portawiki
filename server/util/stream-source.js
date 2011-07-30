var EventEmitter = 	require('events').EventEmitter;
var closure = 		require('./node-closure');

/**
 * for presenting a simple String to a function that requires an input stream.
 */

StreamSource = function(string) {
	this.string = string;
	this.emitter = new EventEmitter();
	process.nextTick(closure.callback(this, this.exec));
};

StreamSource.prototype.setEncoding = function() {
};

StreamSource.prototype.on = function(evt, cb) {
	this.emitter.on(evt, cb);
};

StreamSource.prototype.exec = function(evt, cb) {
	this.emitter.emit('data', this.string);
	this.emitter.emit('end');
};

exports.StreamSource = StreamSource;
