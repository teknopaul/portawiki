
var m3Auth = require('../auth/m3-auth');


var cm = new m3Auth.CookieModel();
cm.data.push("hello");
cm.data.push("world");
console.log(cm);

var iter = cm.iterator();
while (iter.hasNext()) {
	console.log("cm: " + iter.next());
}

var cookieString = m3Auth.secureCookieData("key", cm);
console.log(cookieString);

var cmback = m3Auth.validateCookieString("key", cookieString, 10000, true);

var iter = cmback.iterator();
while (iter.hasNext()) {
	console.log("cmback: " + iter.next());
}