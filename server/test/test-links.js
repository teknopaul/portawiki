var assert = 	require('assert');
var nodeunit = 	require('nodeunit');
var links = 	require("../http_mods/links.js");
var mocks = 	require('mocks');
/**
 * test LinkModel and persist/materialise
 */
module.exports.testLinkModel = function(test) {

	var newArr = [];
	var json = {url : 'http://tp23.org', title:'tp23', description: 'Home of nothing', icon : '/img/blah.png'};
	var linkModel = links.factory(json);
	
	//console.dir(linkModel);
	//console.log(linkModel.toXHTML());
	
	test.ok(typeof linkModel == 'object');
	
	newArr.push(linkModel);
	
	links.persist('/tmp/links.shtml', newArr, function(err) {
		test.ok(!err);
		
		links.materialize('/tmp/links.shtml', function(err, data) {
			//console.dir(data);
			//console.dir("Materialised data: " + data);
			test.ok(!err);
			test.equals(json.url, data[0].url);
			test.done();	
		});
		
	});
	
};


/**
 * test get as JSON
 */
module.exports.testDoGet = function(test) {
	
	//console.log("testDoGet");
	
	require("../util/config.js").emitter.on('configReady', function() {
		
		var conf = require("../util/config.js").configData;
		
		conf.appjsdir = '/tmp';
		
		var response = new mocks.response();
		response.end = function() {
			try {
				
				//console.log("Resonse: " + response.streamed);
				
				JSON.parse(response.streamed);
				test.ok(true);
				
			} catch(err) {
				test.ok(false, 'Exception parsing JSON' + response.streamed);
			}
			test.done();
		};
		
		links.doGet(new mocks.request(), response , "");
		
	});
	
};

/**
 * test POST a JSON
 */
module.exports.testDoPost = function(test) {
	
	console.log("testDoPost");
	
	require("../util/config.js").emitter.on('configReady', function() {
		
		var conf = require("../util/config.js").configData;
		
		conf.appjsdir = '/tmp/data';
		try {
			require('fs').mkdirSync(conf.appjsdir, 0777);
		} catch(err) {
			
		}
		
		var response = new mocks.response();
		response.end = function() {
			try {
				
				//console.log("Resonse: " + response.streamed);
				
				JSON.parse(response.streamed);
				test.ok(true);
				
			} catch(err) {
				test.ok(false, 'Exception parsing JSON' + response.streamed);
			}
			test.done();
		};
		
		var newUrl = {
			url: "http://tp23.org",
			title: "tp23.org"
		};
		var request = new mocks.request(JSON.stringify(newUrl), '/');
		
		links.doPost(request, response , "");
		
	});
	
};

/**
 * test POST a JSON with &del=http://tp23.org
 */
module.exports.testDoPostDelete = function(test) {
	
	console.log("testDoPost");
	
	require("../util/config.js").emitter.on('configReady', function() {
		
		var conf = require("../util/config.js").configData;
		
		conf.appjsdir = '/tmp/data';
		try {
			require('fs').mkdirSync(conf.appjsdir, 0777);
		} catch(err) {
			
		}
		
		var response = new mocks.response();
		response.end = function() {
			try {
				
				//console.log("Resonse: " + response.streamed);
				
				JSON.parse(response.streamed);
				test.ok(true);
				
			} catch(err) {
				test.ok(false, 'Exception parsing JSON' + response.streamed);
			}
			test.done();
		};
		

		var request = new mocks.request("", '');
		var url = {};
		url.query = {};
		url.query.del = 'http://tp23.org';
		links.doPost(request, response , url);
		
	});
	
};

