
/**
 * A stream that collects all the String data into memory.
 */

Collector = function() {
	this.data = '';
};

Collector.prototype.write = function(string) {
	this.data += string;
};

Collector.prototype.getData = function() {
	return this.data;
};

Collector.prototype.end = function() {
};

Collector.prototype.flush = function() {
};



exports.Collector = Collector;