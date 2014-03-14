var fs = require('fs'), path = require ('path'), async = require('async');

var dirReaderVerbose, outputFce, _this;

var DirReader = function(verbose) {
	dirReaderVerbose = verbose;
	_this = this;
};

DirReader.prototype.setOutputFunction = function(output) {
	outputFce = output;
};

DirReader.prototype.exploreDir = function(baseDir, dir, cb) {
	fs.stat(path.join(baseDir,dir), function(err,stats){
		if(err) {
			cb(err);
			return;
		}

		if(stats.isFile()) { // Dir je typu file - zapis
			if(dirReaderVerbose) console.log('FILE: ' + dir);
			outputFce(baseDir, dir);
			cb(null);
		}
		else if(stats.isDirectory()) {
			if(dirReaderVerbose) console.log('DIRECTORY: ' + dir);
			return fs.readdir(path.join(baseDir, dir), function(err, files) {
				if(err) {
					cb(err);
					return;
				}

				dirFiles = files.map(function(file) {
					return path.join(dir,file);
				});
				var exploreSubDir = async.apply(_this.exploreDir, baseDir);
				async.each(dirFiles, exploreSubDir, cb);
			});
		}
		else
			if(dirReaderVerbose) console.log('OSTATNI: ' + dir);
	});
};

module.exports = exports = DirReader;