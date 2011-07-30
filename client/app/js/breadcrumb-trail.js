if(typeof pw=='undefined') {
	/**
	 * @namespace pw namespace object
	 */
	var pw = new Object();
}
if(typeof require != 'undefined') {
	pw.validatePageName = require("./page-name-validator").validatePageName;
}


/**
 * Takes /view/a/b/c/file.html  and returns an HTML representation of 
 * a > b > c
 */
pw.breadcrumbTrailHtml = function(pathname) {
	var dotIdx = pathname.indexOf('.');
	if ( dotIdx  > -1 ) {
		pathname = pathname.substring(0, dotIdx);
	}
	pathname = pw.validatePageName(pathname, false);
	var segments = pathname.split('/');
	var pathSoFar = "/view";
	var html = '<div class="pw-breadcrumb-trail"><span>Path &raquo; <a href="/view/">root</a>';
	for(var i = 2; i < segments.length - 1; i++) {
		html += ' &raquo; ';
		pathSoFar += '/' + segments[i];
		html += '<a href="' + pathSoFar+ '/">' + segments[i].replace(/_/g, ' ') + '</a>';
	}
	html += '</span></div>';
	return html;
};



// console.log(pw.breadcrumbTrailHtml("/view/a/b/c/file.html"));
