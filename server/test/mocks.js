


request = function(data, url) {
	this.url = url;
	this.data = data;
	this.on = function(evt, cb) {
		if (evt == 'data') {
			cb(data);
		}
		else if (evt == 'end') {
			cb();
		}
	};
};

response = function() {
	this.streamed = '';
	this.setHeader = function(){};
	this.write = function(data) {
		if (typeof data == 'string') {
			this.streamed += data;
		}
		console.log(data);
	};
	this.writeHead = function(code){
		console.log("writeHead " + code);
	};
	this.end = function(){} ;
};

url = function(url)  {
	this.pathname = url || '/';
};

exports.request = request;
exports.response = response;
exports.url = url;
