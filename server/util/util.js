

toHtml = function(value) {
	if(typeof value == 'string') {
		value = value.replace(/&/g, '&amp;');
		value = value.replace(/</g, '&lt;');
		value = value.replace(/>/g, '&gt;');
		value = value.replace(/"/g, '&quot;');
		value = value.replace(/'/g, '&apos;');
	}
	return value;
};

removeDoubleSlash = function(input) {
	var c = '', last = '', output = '';
	for (var i = 0 ; i < input.length; i++) {
		c = input.charAt(i);
		if (c == '/' && last == '/') {
			// skip
		}
		else {
			output += c;
		}
		last = c;
	}
	return output;
};

exports.toHtml = toHtml;
exports.removeDoubleSlash = removeDoubleSlash;

/*!
* Connect - utils
* Copyright(c) 2010 Sencha Inc.
* Copyright(c) 2011 TJ Holowaychuk
* MIT Licensed
*/
/**
* Parse the given cookie string into an object.
*
* @param {String} str
* @return {Object}
* @api public
*/
exports.parseCookie = function(str){
  var obj = {}
    , pairs = str.split(/[;,] */);
  for (var i = 0, len = pairs.length; i < len; ++i) {
    var pair = pairs[i]
      , eqlIndex = pair.indexOf('=')
      , key = pair.substr(0, eqlIndex).trim().toLowerCase()
      , val = pair.substr(++eqlIndex, pair.length).trim();

    // quoted values
    if ('"' == val[0]) val = val.slice(1, -1);

    // only assign once
    if (undefined == obj[key]) {
      val = val.replace(/\+/g, ' ');
      try {
        obj[key] = decodeURIComponent(val);
      } catch (err) {
        if (err instanceof URIError) {
          obj[key] = val;
        } else {
          throw err;
        }
      }
    }
  }
  return obj;
};
	
