

var util = require('../util/util.js');

exports.test = function(test) {
	test.equals(util.removeDoubleSlash('/view//Software//index.html'), '/view/Software/index.html');
	test.equals(util.removeDoubleSlash('/'), '/');
	test.equals(util.removeDoubleSlash('/././') , '/././');
	
	test.done();
};

