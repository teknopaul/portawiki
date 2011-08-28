/**
 * Test authorizer that requires the user admin and the password "null"
 */

exports.authorize = function(username, password, cb) {
	if (username == 'admin'  && password == 'null') {
		cb(true);
	}
	else {
		cb(false);
	}
};
