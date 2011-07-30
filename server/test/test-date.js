var fs = require('fs');

var date = require("../util/date.js");


console.log("Now in HTTP time (GMT) " + date.toHttpDate(new Date()));

var dateFrom = date.fromHttpDate('Wed, 13 Jul 2011 23:15:19 GMT');
console.log("Parsing Wed, 13 Jul 2011 23:15:19 GMT = " + dateFrom +  " and back = " + date.toHttpDate(dateFrom));

fs.stat(".", function(err, stat) {
	console.log( date.toHttpDate(stat.mtime));
	//console.dir(stat);
});
