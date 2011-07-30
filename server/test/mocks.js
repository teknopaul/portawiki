


request = function(data) {
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
	this.setHeader = function(){};
	this.write = function(data){
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
