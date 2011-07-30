
var BufferedStream = require('./buffered-stream').BufferedStream;

/**
 * Parser to read a Stream and catch @@ directives and replace with values from a supplied environment.
 */
Parser = function(name, instr, outstr, env) {
	var self = this;

	this.name = name;
	this.env = env;
	this.initialized = false;
	this.instream = instr;  // Input stream
	this.data = null;
	this.outstream = new BufferedStream(outstr); // Output stream
	
	// vars for matching the @title@ line
	this.buffer = ''; // max line length
	this.matching = false;
	this.inAts = false;
		
	/**
	 * Carry on processing the data, from position pos.
	 * @return true if all the data was consumed, false if we were paused in the middle.
	 */
	this.doContinue = function() {
		try {
			for (var i = 0 ; i < this.data.length ; i++) {
				
				var c = this.data.charAt(i);
				
				if (this.matching && this.buffer.length > 1000) { // safety latch we many have started matching on an email address 
					this.outstream.write(this.buffer);
					this.buffer = '';
					this.matching = false;
				}
				else if ( ( ! this.matching ) && c == '@') { // found a @ could be a @name@ start matching
					this.matching = true;
					this.buffer += c;
				}
				else if (this.matching && c == '@') { // found a full @name@  match! inject it to the stream
					var value = this.env[this.buffer.substring(1)];
					if (typeof value == 'string') { 
						this.outstream.write(value);
					}
					else { // no value in the env, the buffer is part of the template
						this.outstream.write(this.buffer);
					}
					this.buffer = '';
					this.matching = false;
				}
				else if (this.matching) {
					this.buffer += c;
				}
				else {
					this.outstream.write(c);
				}
			}
		} catch(err) {
			console.error("Error parsing " + err);
		}
	};
	
	this.flush = function() {
		this.outstream.flush();
	};

};

Parser.prototype.exec = function(callback) {
	var self = this;
	
	this.instream.setEncoding("utf8");
	
	this.instream.on('error', function(err) {
		console.error("Error received in parser " + self.name + ":" +err);
		self.flush();
		if (callback) {
			callback('error');
		}
	});

	this.instream.on('end', function() {
		//console.error("End received in parser " + self.name);
		if (self.inSSI == true) {
			console.log("Unterminated SSI statement");
		}
		self.flush();
		if (callback) {
			callback('end');
		}
	});

	this.instream.on('data', function(data) {
		//console.log("on data");
		self.data = data;
		self.doContinue();
	});
	
};

exports.Parser = Parser;
