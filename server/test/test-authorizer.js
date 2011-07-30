
var authorize = require("../auth/authorizer").authorize;

console.log('' + authorize("bob", "changeme"));
console.log('' + authorize("admin", "null"));



setTimeout(function() {
	console.log('' + authorize("bob", "changeme"));
	console.log('' + authorize("admin", "null"));	
}, 1000);