
/**
 * uploader
 */
pw.Upload = function(dom , rootDirectory) {
	var self = this;
	this.dom = dom;
	this.data = {
		directory: rootDirectory
	};
	this.dom.click(function(){
		self.renderForm(self.data.directory);
	});
};
pw.Upload.prototype.renderIcon = function(basedir) {
	this.data.directory = basedir;
	var output = '';
	output += '<a href="#" id="pw-upload-button" title="Upload">';
	output += '<img src="res/img/upload.png" alt="Upload files">';
	output += '<div id="pw-upload-dir">' + basedir + '</div>';
	output += '</a>';
	this.dom.html(output);
};

pw.Upload.prototype.renderForm = function(basedir){
	var output = '';
	output += '<div id="pw-upload-dir"></div>';
	output += '<iframe id="pw-upload-frame" src="about:blank"/>';
	this.dom.html(output);
	this.dom.find('#pw-upload-dir').text("Upload to " + basedir);
	var frame = this.dom.find('#pw-upload-frame');
	frame[0].src = '../upload.html?basedir=' + basedir;
};