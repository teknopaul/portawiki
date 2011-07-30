

exports.authorize = function(username, password) {
	if (username == 'admin'  && password == 'null') {
		return true;
	}
	return false;
};
