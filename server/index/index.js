var fs = require('fs');

/**
 * A mini JSON data indexing system that keeps certain values form JSON blobs on disk in memory.
 * 
 * In the same way you would create an index on the primary key in a table this class keeps an index
 * of any attributes of JSON in a directory.
 */


UniqueIndex = function(resolver, dir, key) {
	this.resolver = resolver;
	this.dir = dir;
	this.key = key;
	this.theIndex = {};
};

/**
 * adds a mapping to the index where key points to pathname.
 */
UniqueIndex.prototype.addKey(pathname, key) {
	this.theIndex[key] = pathname;
};
/**
 * Add an object to the index, the key is read from the object and 
 * used to index the pathname.
 */
UniqueIndex.prototype.addObject(pathname, object) {
	this.theIndex[object[this.key]] = pathname;
};
/**
 * Add a path to the index the object will be read form disk entirely
 * to find the key from the JSON blob, thus is not vbery efficient.
 */
UniqueIndex.prototype.addPath(pathname, cb) {
	resolver.resolveData(pathname, false, function(fileSystemPath) {
		fs.readFile(fileSystemPath, function(err, data) {
			if (!err) {
				var object = JSON.parse(data);
				this.addObject(pathname, object);
				if (cb) cb(true);
			}
			else {
				if (cb) cb(false);
			}
		});
	});
};

/**
 * Reads ALL the data of ALL the files in the directory and indexes them.
 * The newly loaded index is then merged with the old one in case new item
 * have been added to the old index while the new one was loading.
 * 
 * Its times like this when you want a second thread!
 */
UniqueIndex.prototype.reIndex = function() {
	var newIndex = new Index(this.resolver, this.dir, this.key);
	
	var self = this;
	fs.list(this.dir, function(err, files) {
		var count = files.length;
		if (err) {
			console.log("could not load index for " + self.dir);
		}
		for (var i = 0 ; i < files.length ; i++) {
			if (files[i].lastIndexOf(".json") == files[i].length - 5) {
				newIndex.addPath(files[i], function () {
					count--;
					if (count == 0) {
						self.addAll(newIndex.theIndex);
					}
				});
			}
			else {
				count--;
				if (count == 0) {
					self.addAll(newIndex.theIndex);
				}
			}
		}

	});
};

UniqueIndex.prototype.addAll = function(newIndex) {
	for(item in newIndex) {
		this.theIndex[item] = newIndex[item];
	}
};
/**
 * Get an object from disk using the index value.
 */
UniqueIndex.prototype.get = function(key, cb) {
	var pathname = this.index[key];
	resolver.resolveData(pathname, false, function(fileSystemPath) {
		fs.readFile(fileSystemPath, function(err, data) {
			if (!err) {
				cb(false, JSON.parse(data));
			}
			else {
				cb(true);
			}
		});
	});
};

/**
 * Search for an object
 * @return a list of pointers/pathnames to the objects that can be turned into objects
 * by resolving the path and reading off disk.
 */
UniqueIndex.prototype.search = function(regex) {
	var found = [];
	for (key in this.tportaheIndex) {
		if ( regex.test(key) ) {
			found.push(this.theIndex[key]);
		}
	}
	return found;
};

/**
 * Serialize writes this object to disk as a JSON blob.
 */
UniqueIndex.prototype.serialize(aSync) {
	if (aSync) {
		_serializeASync();
	}
	else {
		_serializeSync();
	}	
};
UniqueIndex.prototype._serializeASync = function(fsMethod) {
	fs.writeFile(this.dir + "/.json.index", JSON.stringify(this), "utf-8");
};
UniqueIndex.prototype._serializeSync = function(fsMethod) {
	fs.writeFileSync(this.dir + "/.json.index", JSON.stringify(this), "utf-8");
};

/**
 * Materialize reads the JSON from disk if it exists.
 */
UniqueIndex.prototype.materialize(aSync) {
	if (aSync) {
		_materializeASync();
	}
	else {
		_materializeSync();
	}
};
UniqueIndex.prototype._materializeASync = function(fsMethod) {
	var self = this.
	fs.readFile(this.dir + "/.json.index", "utf-8", function(err, data) {
		if (! err) {
			var loadedCopy = JSON.parse(data);
			self.theIndex = loadedCopy.theIndex;
			self.key = loadedCopy.key;
		}
	});
};
UniqueIndex.prototype._materializeSync = function(fsMethod) {
	var data = fs.readFile(this.dir + "/.json.index", "utf-8");
	var loadedCopy = JSON.parse(data);
	self.theIndex = loadedCopy.theIndex;
	self.key = loadedCopy.key;
};

UniqueIndex.prototype.shutdown = function() {
	fs.writeFile(this.dir + "/.jsin.index", JSON.stringify(this));
};



exports.UniqueIndex = UniqueIndex;



