/**
 * Table of Contents,  this is a directory listing of a directories HTML files.
 */
var fs = 		require('fs');

var config = 	require("../util/config");
var resolve = 	require('./file-resolve.js');
var util = 		require("../util/util");
var closure = 	require("../util/node-closure");

/**
 * Get the Table of Contents as simple HTML
 */
ToC = function(pathname) {
	this.pathname = pathname;
};

ToC.prototype.getHtml = function(tocCallback) {
	this.tocCallback = tocCallback;
	var self = this;
	resolve.resolve(this.pathname, true, function(fileSystemFile) {
		self.fileSystemFile = fileSystemFile;
		fs.readdir(fileSystemFile, closure.callback(self, self.handleReaddir));
	});
};

ToC.prototype.handleReaddir = function(err, files) {
	if (err) {
		var html = '<ul class="pw-toc">\n</ul>'; 
		console.log("Error reading directory " + this.fileSystemFile);
		this.tocCallback(html);
	}
	else {
		this.statAll(this.fileSystemFile, files, closure.callback(this, this.renderHtml));
	}
};

ToC.prototype.renderHtml = function(dirsSorted, filesSorted) {
	var html = '<ul class="pw-toc">\n'; 
	for(var i = 0; i < dirsSorted.length; i++) {
		var file = dirsSorted[i];
		html += '<li><a href="/view' + this.pathname + util.toHtml(file.name) + '/">' + util.toHtml(file.name.replace(/_/g, ' ')) + '/</a></li>\n';
	}
	for(var i = 0; i < filesSorted.length; i++) {
		var file = filesSorted[i];
		html += '<li><a href="/view' + this.pathname + util.toHtml(file.name) + '">' + util.toHtml(file.name.replace(/_/g, ' ')) + '</a></li>\n';
	}
	html += '\n</ul>'; 
	this.tocCallback(html);
};

ToC.prototype.statOne = function(path , fileName, dirs, files, callback) {
	fs.stat(path + '/' + fileName, function(err, stats) {
		if (err) {
			console.log("Error statting " + path + '/' + fileName);
			callback();
		}
		else {
			stats.name = fileName;
			if (stats.isDirectory()) {
				dirs.push(stats);
			}
			else {
				files.push(stats);
			}
			callback();
		}
	});
};

ToC.prototype.statAll = function(path, fileNames, renderFunc) {
	var dirs = [], files= [];
	var count = fileNames.length;
	var foundOne = false;
	for(var i = 0 ; i < fileNames.length ; i++) {
		var fileName = fileNames[i];
		if (fileName.indexOf(".") == 0) {
			count--;
		}
		else if (fileName.indexOf(".bak") == fileName.length - 4) {
			count--;
		}
		else {
			foundOne = true;
			this.statOne(path, fileName, dirs, files, function()  {
				count--;
				if (count == 0) {
					var sorter = function(st1, st2) {
						return st1.name > st2.name;
					};
					files = files.sort(sorter);
					dirs = dirs.sort(sorter);
					renderFunc(dirs, files);
				}
			});
		}
	}
	if ( ! foundOne ) {
		renderFunc([], []);
	}
};

exports.ToC = ToC;
