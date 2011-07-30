var fs = require('fs');
var parse = require('url').parse;

var date = require("../util/date.js");
var resolve = require('../persistence/file-resolve');

/**
 *  "Servlet" filter for /view/ that returns 304 NOT MODIFIED if the 
 *  file on disk has not been changed since the users cached version.
 *  
 *  N.B. FireBug is not diligent in reporting 304s debug with LiveHttpHeaders
 */
filter = function(request, response, chain) {
	var doChain = true;
	try {
		var url = parse(request.url);
		if (url.pathname.indexOf("/view/") == 0 && url.pathname.lastIndexOf(".html") > 0) {
			var ifModifiedSince = request.headers["if-modified-since"];
			
			var pathname = url.pathname.substring("/view".length);
			
			// get the real file's path avoiding ../ trickery
			doChain = false;  // we chain asynchronously now
			resolve.resolve(pathname, true, function(fileSystemPath) {

				fs.stat(fileSystemPath, function(err , stat) {
					if (err) {
						console.log("Error stating file " + err);
					}
					else {
						try {
							if (ifModifiedSince != null) {  // if the user has a copy see if it is valid
								//console.log("if-modified-since " + ifModifiedSince);
								var lastCachedDate = date.fromHttpDate(ifModifiedSince);
								//console.log("lastCachedDate " + lastCachedDate + " - " + lastCachedDate.getTime() + " >= " + stat.mtime.getTime());
								if (lastCachedDate != null && lastCachedDate.getTime() >= stat.mtime.getTime()) {
									response.writeHead(304, "NOT MODIFIED");
									response.end();
									return;
								}
							}
						} 
						catch(err) {
							console.log("Error processing 304 " + err);
						}
						// if we have not cache headers or cache is stale , set the Last-Mod and continue processing the GET
						response.setHeader("Cache-Control", "must-revalidate");
						response.setHeader("Last-Modified", date.toHttpDate(stat.mtime));
					}
					chain.doFilter(request, response);	
				});
				
			});
			
		}
	}
	catch (err) {
		console.log("error in 304 filter " + err);
	}
	
	if (doChain) {
		chain.doFilter(request, response);		
	}
	
};




exports.filter = filter;