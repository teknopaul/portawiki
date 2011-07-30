
var crypto = require('crypto');

/**
 * Converts a time in milliseconds to a base32 timestamp, accurate to one about second.
 * @param time a number or string that can be parsed with parseInt
 * @return a base32 timestamp in the <code>ks5ijf</code>
 * @static
 */
toTimestamp = function(time) {
	if(!time){
		time = new Date().getTime();
	}
	if (typeof time == 'string') {
		time = parseInt(time, 10);
	}
	time = Math.floor(time / 1024);
	return new Number(time).toString(36);
};
/**
 * Converts a timestamp String to a long value in milliseconds. 
 * @param a base32 timestamp in the form <code>ks5ijf</code>
 * @static
 */
fromTimestamp = function(timestamp) {
	return parseInt(timestamp, 36) * 1024;
};

CookieModel = function() {
	this.authenticated = false;
	this.data = new Array();
};

CookieModel.prototype.iterator = function() {
	var data = this.data;
	var idx = 0;
	return new function() {
		this.hasNext = function() {
			return data.length > idx;
		};
		this.next = function() {
			return data[idx++];
		};
	};
};

/**
 * Returns a cookie safe string of pipe separate urlencoded data items and the hmac tagged on the end
 * made of the data and the key . 
 */
secureCookieData = function(key, cookieModel) {
	var sb = '';
	var timestamp = toTimestamp();
	sb += timestamp;
	sb += "|";

	var md = crypto.createHash('sha1');

	var byteArray = new Buffer(key, 'utf-8'); 
	md.update(byteArray);
	
	byteArray = new Buffer(timestamp, 'utf-8'); 
	md.update(byteArray);
	
	var iter = cookieModel.iterator();
	while (iter.hasNext()) {
		var dataItem = iter.next();
		byteArray = new Buffer(dataItem, 'utf-8');
		md.update(byteArray);
		dataItem = uriEncode(dataItem);
		sb += dataItem + "|";
	}
	var base64 = md.digest('base64');
	sb += uriEncode(base64.substring(0, base64.length -1 )); // crop the trailing '='
	return sb;
};

/**
 * @return CookieModel or throws an exception
 */
validateCookieString = function(key, cookieString, timeout, timeCheck) {
	var cookieModel = new CookieModel();
	var cookieData = cookieString.split("|");
	
	// check the token is still valid 
	// N.B. the timestamp is checked against the digest to ensure it is not forged
	var timestamp = cookieData[0];
	var ts = fromTimestamp(timestamp);
	if (ts + timeout < new Date().getTime()) {
		if(timeCheck){
			console.log("Users key expired " + new Date(ts));
			throw "AuthFailedCondition (timeout)";
		}
	}
			
	try {
		var receivedDigest = uriDecode(cookieData[cookieData.length - 1]) + '=';
		
		var md = crypto.createHash('sha1');
		
		var byteArray = new Buffer(key, 'utf-8'); 
		md.update(byteArray);
		
		byteArray = new Buffer(timestamp, 'utf-8');
		md.update(byteArray);
		
		for (var i = 1; i < cookieData.length - 1 ; i++) {
			byteArray = new Buffer(uriDecode(cookieData[i]), 'utf-8');
			md.update(byteArray);
			cookieModel.data.push(uriDecode(cookieData[i]));
		}
		var realDigest = md.digest('base64');
		
		if (realDigest == receivedDigest) {
			cookieModel.authenticated = true;
			return cookieModel;
		}
		
		throw "AuthFailedCondition (mac)";
	}
	catch (ex) {
		throw ex;
	}
};

uriEncode = function(data) {
	return encodeURIComponent(data).replace('/\\+/g', "%20");
};
uriDecode = function(data) {
	return decodeURIComponent(data);
};

exports.toTimestamp = toTimestamp;
exports.fromTimestamp = fromTimestamp;
exports.secureCookieData = secureCookieData;
exports.validateCookieString = validateCookieString;
exports.CookieModel = CookieModel;
