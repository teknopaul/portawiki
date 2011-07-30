

var util = require('../util/util.js');

console.log(util.removeDoubleSlash('/view//Software//index.html'));
console.log(util.removeDoubleSlash('/'));
console.log(util.removeDoubleSlash('/././'));