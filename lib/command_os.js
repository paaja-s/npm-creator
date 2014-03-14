var cp = require('child_process');
var CommandOsVerbose, _this, log = '';

var CommandOs = function(verbose) {
	CommandOsVerbose = verbose;
	_this = this;
};

CommandOs.prototype.commandExec = function(cpSpawnArgs, report, cbParams, cb) {
	if(CommandOsVerbose) {
		var command = cpSpawnArgs.bin;
		cpSpawnArgs.args.forEach(function(par, i){
			command += ' ' + par;
		});
		if(cpSpawnArgs.options.cwd)
			command += ' IN dir:' + cpSpawnArgs.options.cwd;
		console.log('Command:' + command);
	}

	var cpBin = cp.spawn(cpSpawnArgs.bin, cpSpawnArgs.args, cpSpawnArgs.options);

	cpBin.stdout.on('data', _this.getLogFunction('out'));

	cpBin.stderr.on('data', _this.getLogFunction('err'));

	cpBin.on('close', function(code) {
		if(code>0) {
			cb('ERROR CODE: ' + code + '\n' + log);
			_this.log='';
			return;
		}

		if(CommandOsVerbose) console.log(report);
		
		_this.log='';
		
		// Pokud se uskutecni volani cb(null,null) pak dostane nasledujici fce nedefinovany callback
		if(cbParams.ok)
			cb(null, cbParams.ok);
		else
			cb(null);
	});

	cpBin.on('error', function(err) {
		if(CommandOsVerbose) console.log(err);

		cb(err + '/n' + _this.log);
		_this.log='';
	});
};

CommandOs.prototype.getLogFunction = function(typeOfStd) {
	return function(data) {
		if(CommandOsVerbose) console.log('Std' + typeOfStd + ': ' + data);
		_this.log += data; // Pridani do logu
	};
};

module.exports = exports = CommandOs;