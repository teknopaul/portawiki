var fs = require('fs');

var stripParser = require('./strip-parser');
var collect = require("../util/collect-stream.js");
var closure = require("../util/node-closure.js");
var escape = require("dom-js").escape;
var DomJS = require("dom-js").DomJS;


/**
 * Reads the meta data in the file and returns
    meta.createdDate = null;
	meta.createdBy = null;
	meta.editors = [];
 * 
 * 
 * Usage:
 * 
	meta = new MetaData();
	meta.load("./src/static/portawiki/Example1.html", function() {
		console.dir(meta);
	});
 *
 */


MetaData = function() {
	this.cb;
	this.collector = new collect.Collector();
	this.instream;
	this.createdDate = null;
	this.createdBy = null;
	this.editors = [];
};

MetaData.prototype.load = function(fileSystemFile, cb) {
	this.cb = cb;
	this.instream = fs.createReadStream(fileSystemFile);
	this.processFile();
};

MetaData.prototype.processFile = function()  {
	parser = new stripParser.Parser("Meta", this.instream, this.collector);
	parser.matchStartString = '<div id="pw-metadata">';
	parser.matchEndString = '</div><!--pw-metadata-->';
	parser.exec(closure.callback(this, this.processText));		
};

MetaData.prototype.processText = function() {
	var metaText = this.collector.getData();
	this.collector = null, this.instream = null;
	var domjs = new DomJS();
	domjs.parse(metaText, closure.callback(this, this.processObject));
};

MetaData.prototype.processObject = function(err, dom) {
	if (err != false) {
		console.log("Could not process meta data: " + dom);
	} else if (dom && dom.children) {
		for (var i = 0 ; i < dom.children.length ; i++ ) {
			if (dom.children[i].name == 'div') { // this is an Element
				var elem = dom.children[i]; 
				if (elem.attributes.class == 'pw-created') {
					this.createdBy = elem.text(); 
					this.createdDate = new Date( elem.children[1].text() );
				} else if (elem.attributes.class == 'pw-edited') {
					name = elem.text(); 
					date = new Date( elem.children[1].text() );
					this.editors.push(new Editor(name, date));
				}
			}
		}
	}
	this.cb(this);
	this.cb = undefined;
};

MetaData.prototype.toXml = function() {
	xml = '<span>\n<div class="pw-created">' + this.createdBy + '<span class="pw-date">' + this.createdDate + '</span></div>\n';
	for (var i = 0 ; i < this.editors.length ; i++ ) {
		xml += '<div class="pw-edited">' + escape(this.editors[i].name) + '<span class="pw-date">' + this.editors[i].date + '</span></div>\n';
	}
	xml += '</span>\n';
	return xml;
};

Editor = function(name, date) {
	this.name = name;
	this.date = date;
};

exports.MetaData = MetaData;
exports.Editor = Editor;

