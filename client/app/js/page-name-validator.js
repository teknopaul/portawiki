if(typeof pw=='undefined') {
	/**
	 * @namespace pw namespace object
	 */
	var pw = new Object();
}

/**
 * used by both node.js and the front end to validate names
 */

pw.charNotAllowd = " character is not allowed in page names";
/**
 * Validates the Name either throws an exception if the name is incorrect
 * or Returns a slightly modified name if the changes are simple.
 * 
 * Validation ensures that there are not non-character or numbers chars
 * whitespace is trimmed and spaces converted to underscores.
 */
pw.validatePageName = function(input, incSlash) {
	for(var i = 0 ; i < input.length ; i++) {
		var c = input.charAt(i);
		var d = input.charCodeAt(i);
		if (input.charCodeAt(i) < 32) {
			throw "Control chars not permitted";
		}
		switch (c) {
			case '/':
				if (incSlash) {
					throw c + pw.charNotAllowd;
				}
				else {
					continue;
				}
			case '\\':
				throw c + pw.charNotAllowd;
			case '.':
				throw c + pw.charNotAllowd;
			case ',':
				throw c + pw.charNotAllowd;
			case ':':
				throw c + pw.charNotAllowd;
			case ';':
				throw c + pw.charNotAllowd;
			case '|':
				throw c + pw.charNotAllowd;
			case '!':
				throw c + pw.charNotAllowd;
			case '"':
				throw c + pw.charNotAllowd;
			case '\'':
				throw c + pw.charNotAllowd;
			case '#':
				throw c + pw.charNotAllowd;
			case '$':
				throw c + pw.charNotAllowd;
			case '%':
				throw c + pw.charNotAllowd;
			case '&':
				throw c + pw.charNotAllowd;
			case '=':
				throw c + pw.charNotAllowd;
			case '?':
				throw c + pw.charNotAllowd;
			case '*':
				throw c + pw.charNotAllowd;
			case '~':
				throw c + pw.charNotAllowd;
			case '<':
				throw c + pw.charNotAllowd;
			case '>':
				throw c + pw.charNotAllowd;
			case '[':
				throw c + pw.charNotAllowd;
			case ']':
				throw c + pw.charNotAllowd;
			case '^':
				throw c + pw.charNotAllowd;
		}
	}
	input = input.trim();
	input = input.replace(/ /g, '_');
	input = input.replace(/\+/g, '_');
	
	return input;
};


if(typeof exports != 'undefined') {
	exports.validatePageName = pw.validatePageName;
}

/*
console.log("name : '" + pw.validatePageName("Hello World", true) + "'");
console.log("name : '" + pw.validatePageName("Hello_World", true) + "'");
console.log("name : '" + pw.validatePageName(" Hello World ", true) + "'");
console.log("name : '" + pw.validatePageName("Hello+World", true) + "'");
console.log("name : '" + pw.validatePageName("Goodbye Cruel World", true) + "'");
console.log("name : '" + pw.validatePageName("Hello World", true) + "'");
console.log("name : '" + pw.validatePageName("Hello World", true) + "'");
try  {
	console.log("name : '" + pw.validatePageName("lets/../hack", true) + "'");
}catch(err) {
	console.log(err);
}
try  {
	console.log("name : '" + pw.validatePageName("lets*", true) + "'");
}catch(err) {
	console.log(err);
}
try  {
	console.log("name : '" + pw.validatePageName("lets.html", true) + "'");
}catch(err) {
	console.log(err);
}
try  {
	console.log("name : '" + pw.validatePageName("/lets.html", false) + "'");
}catch(err) {
	console.log(err);
}
try  {
	console.log("name : '" + pw.validatePageName("/lets.html", true) + "'");
}catch(err) {
	console.log(err);
}
*/
