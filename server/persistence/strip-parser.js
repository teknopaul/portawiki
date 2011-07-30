
var BufferedStream = require('../util/buffered-stream').BufferedStream;

/**
 * Parser to read a Stream of HTML data and strip out the meta data.
 * Reads the file with echo off until the first match then turns echo on
 * when the second match is found returns and sets finished to true to prevent future data events from being processed.
 * 
 * This is used by the edit module to return the user ewditable part of the HTML.
 */
Parser = function(name, instr, outstr) {
	var self = this;

	this.name = name;
	this.finished = false;
	this.instream = instr;  // Input stream
	this.data = null;
	this.outstream = new BufferedStream(outstr); // Output stream
	
	// vars for matching the <div id="pw-content">  line
	this.buffer = ''; // max line length
	this.inStart = true;
	this.echo = false;
	this.matchPos = 0;
	this.matchStartString = '<div id="pw-content">';
	this.matchEndString = '</div><!--pw-content-->';
	this.matchString = this.matchStartString;
	
	this.doContinue = function() {
		try {
			for (var i = 0 ; i < this.data.length ; i++) {
				
				var c = this.data.charAt(i);
				
				// finding a match, buffer what we find
				if (this.matchString.charAt(this.matchPos) == c) {
					
					this.matchPos++;
					this.buffer += c;
					
					if (this.matchPos == this.matchString.length) { // Match!
						if (this.inStart) {  // we have skipped the header turn on echo and start looking for the trailer
							this.matchPos = 0;
							this.buffer = '';
							this.inStart = false;
							this.echo = true;
							this.matchString = this.matchEndString;
						}
						else if (this.echo) { // found the trailer, swallow it, and return, indicate any more data event to be ignored
							this.echo = false;
							this.finished = true;
							this.flush();
							return;
						}
					}
					continue;
				}
				else if (this.matchPos > 0) {  // not a full match echo buffer if in the middle and continue
					this.matchPos = 0;
					if ( this.echo ) {
						this.buffer += c;
						this.outstream.write(this.buffer);
					}
					this.buffer = '';
				}
				else {
					if ( this.echo ) { 
						this.outstream.write(c);
					}
				}
			}
		} catch(err) {
			console.error("Error parsing " + err);
		}
	};
	
	this.resetMatching = function() {
		this.buffer = ''; // max line length
		this.matching = false;
		this.matchPos = 0;
	};
	
	this.flush = function() {
		this.outstream.flush();
	};

};

Parser.prototype.exec = function(callback) {
	var self = this;
	this.matchString = this.matchStartString; // re do this so clients can overrid the start and end searches
	
	this.instream.setEncoding("utf8");
	
	this.instream.on('error', function(err) {
		console.error("Error received in parser " + self.name + ":" +err);
		self.flush();
		callback.apply(self, ['error']);
	});

	this.instream.on('end', function() {
		self.flush();
		callback.apply(self, ['end']);
	});

	this.instream.on('data', function(data) {
		if (self.finished) {
			return;
		}
		self.data = data;
		self.doContinue();
	});
	
};

exports.Parser = Parser;
