
var authorize = require("../auth/authorizer").authorize;

var count = 0;
function done(test) {
	if ( ++count == 4 ) {
		test.done();
	}
};

module.exports.test = function(test) {
	
	authorize("bob", "changeme", function(ok) {
		console.log("bob:" + ok);
		test.ok( ! ok);
		done(test);
	});
	authorize("admin", "null", function(ok) {
		console.log("admin:" + ok);
		test.ok(ok);
		done(test);
	});
	
	
	
	setTimeout(function() {
		authorize("bob", "changeme", function(ok) {
			console.log("bob:" + ok);
			test.ok( ! ok);
			done(test);
		});
		authorize("admin", "null", function(ok) {
			console.log("admin:" + ok);
			test.ok(ok);
			done(test);
		});	
	}, 1000);
};
