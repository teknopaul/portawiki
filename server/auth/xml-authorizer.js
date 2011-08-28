var fs = require('fs');
var domjs = require('dom-js');

/**
 * Reads the user database from an XML file
 * <users>
 * 	<user username="" password=""/>
 * </users>
 * 
 * N.B. this will not authorize correctly until the file is loaded which happens asynchronously.
 * that might mean oooh 0.1 seconds.
 * 
 */
var users = {};

function init() {
	var instream = fs.createReadStream("../conf/users.xml");
	
	var buffer = '';
	instream.on('data', function(data) {
		buffer += data;
	});
	instream.on('end', function() {
		var parser = new domjs.DomJS();
		parser.parse(buffer, function(err, dom) {
			if (err) {
				console.log("error loading user DB");
			}
			else {
				//console.dir(dom);
				for (var i = 0 ; i < dom.children.length; i++ ) {
					if ('user' == dom.children[i].name) {
						var userElem = dom.children[i];
						users[userElem.attributes.username] = userElem.attributes.password;
						//console.log("Loaded: " + userElem.attributes.username) ;
					}
				}
			}
			console.log("Loaded users");
		});
	});
};

authorize = function(user, pass, cb) {
	var password = users[user];
	cb(pass == password);		
};

authorize.init = init;

exports.authorize = authorize;

