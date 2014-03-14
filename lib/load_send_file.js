var fs = require('fs');

var fileVerbose;

exports.setLoadSendFileVerbose = function(verbose) {
	fileVerbose = verbose;
};

exports.loadFile = function(filepath, httpRequest, console_args, cb) {
	var stream = fs.createWriteStream(filepath, { flags : 'w' }); // Zapisovaci stream natahovaneho souboru
	
	httpRequest.pipe(stream); // Zapis pipou

	stream.on('close',function() {
		if(fileVerbose) console.log(console_args.close);

		cb(null);
	});

	stream.on('error', function (err) {
		if(fileVerbose) console.log(console_args.err);

		cb(err);
	});
};

exports.sendFile = function(filepath, http_args, console_args, cb) {
	var rstream = fs.createReadStream(filepath); // Cteci stream archivu

	http_args.response.writeHead(http_args.statusCode, {'Content-Type': http_args.contentType});

	rstream.pipe(http_args.response);
	
	rstream.on('close', function() {
		if(fileVerbose) console.log(console_args.report);

		cb(null);
	});

	rstream.on('error', function(err) {
		http_args.response.write(http_args.error);
		
		cb(err);
	});
};