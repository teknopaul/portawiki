if (typeof pw=='undefined') {
	/**
	 * @namespace pw namespace object
	 */
	var pw = new Object();
}

/**
 * @constructor
 */
pw.LinksEditor = function(){
	this.view = new pw.LinksEditorView(this);
};

pw.LinksEditor.prototype.init = function() {
	this.get();
};

pw.LinksEditor.prototype.get = function() {
	var self = this;
	jQuery.ajax({
		type : 'GET',
		url : '/links/',  
		dataType : 'json',
		success : function(response) {
			self.view.render(response);
		},
		error : function(response) {
			popup.alert("Error");
		}
	});
};

pw.LinksEditor.prototype.add = function(model) {
	var self = this;
	jQuery.ajax({
		type : 'POST',
		url : '/links/',  
		dataType : 'text',
		data : JSON.stringify(model),
		success : function(response) {
			self.view.add(model);
		},
		error : function(response) {
			popup.alert("Error");
		}
	});
};

pw.LinksEditor.prototype.del = function(href) {
	var self = this;
	jQuery.ajax({
		type : 'POST',
		url : '/links/?del=' + encodeURI(href),  
		dataType : 'json',
		data : "",
		success : function(response) {
			//popup.alert("Deleted");
		},
		error : function(response) {
			popup.alert("Error");
		}
	});
};

/**
 * Test a link by sending a HEAD request.
 */
pw.LinksEditor.prototype.testLink = function(url) {
	jQuery.ajax({
		type : 'HEAD',
		url : url,  
		success : function(response) {
			popup.alert("OK");
		},
		error : function(response) {
			popup.alert("Error");
		}
	});
};

pw.LinksEditorView = function(controller){
	this.controller = controller;
	this.maxUid = 0;
};

pw.LinksEditorView.prototype.render = function(links) {
	var div = jQuery("#pw-links-list");
	var html = new $.htmlBuffer();
	if (links.length == 0) {
		html.html('<div id="pw-no-links">');
		html.html('No links created<br/>');
		html.html('</div>');
	}
	html.html(this.renderForm());
	for ( var i = 0; i < links.length; i++) {
		var linkModel = links[i];
		html.html('<div class="pw-link-desc">');
		this.maxUid = i;
		html.html(this.renderModel(linkModel, this.maxUid));
		html.html('</div>');
	}
	div.append(html.toString());
	this.bindFormControls();
};

/**
 * Convert one model to an XHMTL snippet (not a doc, no wrapping element).
 * @param model
 */
pw.LinksEditorView.prototype.renderModel = function(model, uid) {
	var m = model;
	var html = new $.htmlBuffer();
	html.html('<div id="pw-link-').text(uid).html('">');
	// ⓧ  delete
	html.html('<a class="pw-link-delete" href="#pw-link-' + uid + '" title="delete">ⓧ</a>');
	html.html('URL: <code>').text(m.url).html("</code><br/>");
	html.html('Title: <em>').text(m.title).html("</em><br/>");
	html.html('Desctiption: ').text(m.description).html("<br/>");

	html.html(' ⇢ <a href="').html(m.url).html('" ');
	if (m.description) {
		html.html('title="').text(m.description).html('" ');
	}
	html.html('class="pw-link">');
	if (m.icon) {
		html.html('<img src="').text(m.icon).html('" class="pw-link-icon"/>');
	}
	if (m.title) {
		html.text(m.title);
	}
	html.html('</a>');
	// html.html('Icon: ');
	
	html.html('</div>');
	return html.toString();
};
/**
 * Convert one model to an XHMTL snippet (not a doc, no wrapping element).
 * @param model
 */
pw.LinksEditorView.prototype.renderForm = function(model) {
	var html = new $.htmlBuffer();
	html.html('<div>');
	html.html('<form action="#" name="links-editor" id="pw-links-editor-form" onsubmit="return false;">');
	html.html('<div id="pw-add-link-text">Add a new link</div>');
	html.html('<label>URL</label><input type="text" name="url"></input><br/>');
	html.html('<label>Title</label><input type="text" name="title" length="12"></input><br/>');
	html.html('<label>Description</label><input type="text" name="description" maxlength="140"></input><br/>');
	// TODO html.html('<label>URL</label><input type="text" name="icon"></input><br/>');
	html.html('<input id="pw-links-form-test" type="button" value="Test link"></input> ');
	html.html('<input id="pw-links-form-add" type="button" value="Add link"></input><br/>');
	html.html('</form>');
	html.html('</div>');
	return  html.toString();
};

pw.LinksEditorView.prototype.bindFormControls = function(){
	var self = this;
	var form = jQuery("#pw-links-editor-form")[0];
	if (form) {
		var button = jQuery("#pw-links-form-test");
		button.click($.callback(this, this.testLink));
		button = jQuery("#pw-links-form-add");
		button.click(function() {
			var form = jQuery("#pw-links-editor-form")[0];
			var json = {
					url : form['url'].value, 
					title : form['title'].value, 
					description : form['description'].value	
			};
			self.controller.add(json);
		});
	}
	jQuery(".pw-link-delete").click($.callback(this, this.remove));
};

/**
 * Remove HREF from view
 * Called with context of the element that fires it
 */
pw.LinksEditorView.prototype.remove = function(evt) {
	// I ❤ jQuery
	this.controller.del(jQuery(evt.target.hash + ' > code').text());
	jQuery(evt.target.hash).remove();
};
/**
 * Render a model to the list
 */
pw.LinksEditorView.prototype.add = function(model) {
	var html = renderModel(model, ++this.maxUid);
	jQuery("#pw-no-links").remove();
	jQuery("#pw-links-list").append(html);
};
