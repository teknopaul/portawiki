if(typeof pw=='undefined') {
	/**
	 * @namespace pw namespace object
	 */
	var pw = new Object();
}

// Ugly global but this is global to the page too
var popup = new pw.Popup();

pw.Menu = new Object();

pw.Menu.edit = function() {
	if (document.cookie.indexOf("M3") == -1) {
		popup.alert("Authentication required", "Login to edit pages");
	} else {
		document.location.href = '/app/edit.html?pageName=' + pw.getPageName();
	}
};

pw.Menu.newPage = function() {
	if (document.cookie.indexOf("M3") == -1) {
		popup.alert("Authentication required", "Login to edit pages");
		return;
	}
	popup.prompt("New Page" , "Enter the new page's name (just characters and spaces)", function(title){
		try {
			title = pw.validatePageName(title);
			
			var dirName = pw.dirname(document.location.pathname.substring("/view".length));
			jQuery.ajax({
				type : 'POST',
				url : '/new/?pageName=/' + dirName + '/' + title,  
				dataType : 'json',
				success : function(response) {
					popup.alert("Created", title);
				},
				error : function(response) {
					popup.alert("Error");
				}
			});
		}
		catch(err) {
			popup.alert(err);
		}		
	});
};

pw.Menu.newCategory = function() {
	if (document.cookie.indexOf("M3") == -1) {
		popup.alert("Authentication required", "Login to edit pages");
		return;
	}
	popup.prompt("New Category", "Enter the new category's name (just characters and spaces)", function(title) {
		try {
			title = pw.validatePageName(title);
			
			var dirName = pw.dirname(document.location.pathname.substring("/view".length));
			
			jQuery.ajax({
				type : 'POST',
				url : '/new-category/?path=/' + dirName + '/' + title,  
				dataType : 'json',
				success : function(response) {
					popup.alert("Created", title);
				},
				error : function(response) {
					popup.alert("Error", response);
				}
			});
		}
		catch(err) {
			popup.alert(err);
		}		
	});
};

pw.Menu.upload = function() {
	if (document.cookie.indexOf("M3") == -1) {
		popup.alert("Authentication required", "Login to edit pages");
		return;
	}
	var dialog = new pw.Popup();
	
	var dirName = pw.dirname(document.location.pathname.substring("/view".length));
	
	var html = new $.htmlBuffer();
	html.html('<h3>Upload</h3><iframe id="pw-upload-frame" src="/app/upload.html?basedir=')
		.text(dirName)
		.html('" style="width:500px"/><button id="pw-close">Close</button>');
	dialog.popup(html.toString());
	jQuery("#pw-close").click($.callback(dialog, dialog.dispose));
};

pw.Menu.history = function() {
	var showing = jQuery("div.pw-metadata");
	if ( showing.length == 0 ) {
		var data = jQuery("#pw-metadata").html();
		var html = '<div id="pw-history-title"><a href="#" id="pw-history-close" class="pw-css-button">x</a></div>';
		
		html += '<div class="pw-metadata">' + data + '</div>';
		jQuery("#main").prepend(html);
		jQuery("#pw-history-close").click(function() {
			jQuery("#pw-history-close").remove();
			jQuery("#main > div.pw-metadata").remove();
		});
	}
};


pw.bindMenu = function() {
	jQuery("#pw-edit").click(pw.Menu.edit);
	jQuery("#pw-new").click(pw.Menu.newPage);
	jQuery("#pw-new-category").click(pw.Menu.newCategory);
	jQuery("#pw-history").click(pw.Menu.history);
	jQuery("#pw-upload").click(pw.Menu.upload);
};

pw.bindLogin = function() {
	jQuery("#pw-login").click(function() {
		new pw.Popup().login('Login', 'Enter username and password', function(username, password) {
			jQuery.ajax({
				type : 'POST',
				url : '/session/authenticate',
				data : {
					username : username,
					password : password
				},
				dataType : 'json',
				success : function(response) {
					if (response.m3_ok) {
						popup.alert("Logged in", 'Welcome on board');
					}
					else if(response.m3_condition.code == 2){
						popup.alert("Error" , 'Password wrong?');
					}
				},
				error : function(response) {
					popup.alert("Error" , 'Network error');
				}
			});
		});
	});
};


/**
 * @class
 */
pw.Editor = function() {
};

pw.Editor.prototype.saveAndView = function() {
	this.save(true);
};
pw.Editor.prototype.save = function(docReload) {
	var params = pw.getQueryParameters();
	
	// jQuery(".pw-html-editor").val();  N.B. this has the OLD content before editing!

	var foo = tinyMCE;
	
	var data = tinyMCE.activeEditor.getContent();
	
	jQuery.ajax({
		url : '/save/' + params.pageName,  
		dataType : 'text',
		type : 'post',
		data : data,
		success : function(response) {
			if (docReload == true) {
				document.location.href = /view/ + params.pageName;
			}
		},
		error : function(response) {
			popup.alert("Error saving");
		}
	});
	return false;
};

pw.Editor.prototype.init = function() {
	var self = this;
	var params = pw.getQueryParameters();
	
	jQuery("#pw-title").text(pw.getPageTitle(params.pageName));
	jQuery.ajax({
		url : '/edit/' + params.pageName,  
		dataType : 'text',
		success : function(response) {
			
			jQuery("textarea.pw-html-editor").val(response);
			
		},
		error : function(response) {
			popup.alert("Error");
		}
	});
	jQuery("#pw-save").click($.callback(this, this.save));
	jQuery("#pw-save-and-view").click($.callback(this, this.saveAndView));
	jQuery("#pw-editor-form").submit(function(){return false;});
};

pw.getPageTitle = function(fileName) {
	var start = fileName.lastIndexOf('/');
	if (start < 0) {
		start = 0;
	} else {
		start++;
	}
	var end = fileName.lastIndexOf('.');
	if (end < 0) {
		end = fileName.length;
	}
	return fileName.substring(start, end).replace(/_/g, ' '); 
};

pw.getPageName = function() {
	var path = document.location.pathname;
	if (path.length == 0 || path.length == 1) {
		throw "Missing path";
	}
	// TODO host a context
	var start = path.indexOf("/view/");
	if (start < 0) {
		throw "Missing context"; 
	}
	var pageName = path.substring("/view/".length + start);
	return pageName;
};

/**
 * Returns the query parameters of the current page as a JavaScript object.
 * <br>
 * Strings returned in the object are URI decoded, <b>thus are XSS risks</b>.
 * <br>
 * e.g.
 * <br><br>
 * 
 * <pre>/mode3/test?param1=1234&param2=5676&hack=%3Cscript%3E</pre>
 * 
 * is returned as a JavaScript object
 * 
 * <pre>
 * {
 *  param1 : "1234",
 *  param2 : "5676",
 *  hack : "&lt;script&gt;"
 * }
 * </pre>
 * 	 
 * @static
 */
pw.getQueryParameters = function(queryString) {
	if (queryString === undefined) {
		queryString = window.location.search;
	}
	var params = new Object();
	if (queryString && queryString.length > 0) {
		if (queryString.indexOf('?') == 0) {
			queryString = queryString.substring(1);
		}
		if (queryString.indexOf('&') > -1) {
			var nameValPairs = queryString.split('&');
			var i = 0;
			for(; i < nameValPairs.length; i++) {
				if (nameValPairs[i].indexOf('=') > -1) {
					var split = nameValPairs[i].split('=');
					params[decodeURIComponent(split[0])] = decodeURIComponent(split[1]);
				}
			}
		}
		else if (queryString.indexOf('=') > -1) {
			var split = queryString.split('=');
			params[decodeURIComponent(split[0])] = decodeURIComponent(split[1]);
		}
		else {
			return decodeURIComponent(queryString);
		}
	}
	return params;
};
/**
 * Take a full URL and return the relative path component.
 */
pw.dirname = function(fileName) {
	var end = fileName.lastIndexOf('/');
	if (end <= 0) {
		return "";
	}
	if (fileName.charAt(0) == '/') {
		return fileName.substring(1, end);
	}
	else {
		return fileName.substring(0, end);
	}
};