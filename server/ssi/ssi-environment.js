var util = require("util");
var events = require('events');
var fs = require('fs');

var DomJS = require("dom-js").DomJS;

/**
 * Loads a default SSI env from ../conf/ssi-environment.xml
 */

/**
 * @constructor
 */
function EnvLoader() {
	events.EventEmitter.call(this);
	this.env = {};
};

util.inherits(EnvLoader, events.EventEmitter);

EnvLoader.prototype.init = function() {
	var self = this;
	// If we have already loaded call listener immediately
	this.on('newListener', function(listener, callback) { // undocumented node.js feature, 2nd arg is the function callback
		if (this.env.initialized) {
			callback(this.env);
		}
	});
	
	fs.readFile("../conf/ssi-environment.xml", 'utf-8', function(err, data) {
		if (err) {
			console.log(err);
		}
		else {
			var domjs = new DomJS();
			domjs.parse(data, function(err, dom) {
				if (err) {
					console.log("Error parsing XML " + dom);
				}
				else {
					for(var i = 0 ; i < dom.children.length; i++) {
						if (dom.children[i].name) {
							var name = dom.children[i].name;
							var value = dom.children[i].text() ;
							self.env[name] = value;
						}
					}
					self.env.initialized = true;
					self.emit('envReady');
					console.log("SSI environment");
					console.dir(self.env);
				}	
			});
		}
	}); 
};

module.exports = new EnvLoader();
module.exports.init();
