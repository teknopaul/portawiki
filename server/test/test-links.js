var assert = 	require('assert');
var nodeunit = 	require('nodeunit');
var links = require("../http_mods/links.js");

/**
 * nodeunit test cases
 */
module.exports.test = function(test) {

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
