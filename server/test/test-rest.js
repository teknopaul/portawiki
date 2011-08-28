var rest = require("../http_mods/rest.js");
var conf = require("../util/config.js");
var mocks = require("./mocks.js");

exports.test = function(test) {
	console.log( rest.resolveTemplate("../data", "users") );
	
	var template = {
			bool : false,
			string : "",
			number : 1,
			array : []
	};
	
	var input = {
			bool : true,
			string : "data",
			number : 2,
			array : ["one", "two", "three"]
	};
	
	console.dir("copyBean: " +  rest.copyBean(template, input));
	console.dir("copyBean: " +  rest.copyBean(template, input));
	
	
	conf.emitter.on('configReady', function() {
		var response = new mocks.response();
		//console.dir(response);
		rest.doGet(new mocks.request() , response, new mocks.url("/data/users"));
		
		//console.log("\n\ndoPost\n\n should 404");
		rest.doPost(new mocks.request('{"name":"Paul Hinds", "handle" : "teknopaul"}') , response, new mocks.url("/data/users")); 
		
		//console.log("\n\ndoPost\n\n should work");
		rest.doPost(new mocks.request('{"name":"Paul Hinds", "handle" : "teknopaul"}') , response, new mocks.url("/data/users/Teknopaul"));
	
		//console.log("Should 404");
		rest.doPost(new mocks.request('{"name":"Paul Hinds", "handle" : "teknopaul"}') , response, new mocks.url("/data/users/Tekno.paul"));
	
		//console.log("Should drop the wrong data");
		rest.doPost(new mocks.request('{"name":"Bob Jones", "handle" : "bob", "wrong" : true}') , response, new mocks.url("/data/users/Bob"));
		
		test.done();
	});

};
