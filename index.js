// NMP Creator
 
// Prijmout a ulozit package.json
// Vytvorit docasny adresar node_modules
// Nainstalovat do nej balicky pomoci npm
// adresar zabalit, vratit vysledek

var http = require('http'), fs = require('fs'), path = require ('path'),
	async = require('async'), params = require('commander'), rmDir = require('rimraf'),
	CommandOs = require('./lib/command_os'), loadSendFile = require('./lib/load_send_file'), DirReader = require('./lib/dir_reader');

var ip = '192.168.10.104', // Virtual
//var ip = '127.0.0.1', // Lokal
	port = 3003,
	tmp_dir = '/tmp', // Tmp adresar ve kterem se budou vytvaret pracovni podadresare dir
	npm_dir = '/home/sg8/node/bin'; // Adresar s binarkou (ci linkem) npm
//	npm_dir = ''; // Adresar s binarkou (ci linkem) npm

params
	.option('-v, --verbose', 'Verbose mode')
	.parse(process.argv);


var commOs = new CommandOs((params.verbose));
loadSendFile.setLoadSendFileVerbose((params.verbose));
//var dreader = new DirReader((params.verbose));
var dreader = new DirReader(false);

var server = http.createServer(function(req,res) { // Instance serveru
	if(params.verbose) console.log('------------------ ' + new Date().toISOString() + ' ------------------');

	var dir = path.join(tmp_dir, 'npmc_' + new Date().getTime()); // Sestaveni cesty pracovniho adresare pro aktualni beh
	if(params.verbose) console.log('DIR:' + dir);
	async.waterfall([
		async.apply(fs.mkdir, dir), // Tvorba podaresare aktualniho sezeni ve kterem se vse odehraje
		async.apply(loadSendFile.loadFile, path.join(dir,'package.json'), req, {close: 'Req stream closed', err: 'Receiving error'}),
		async.apply(checkJSON, dir),
		fs.mkdir, // Tvorba docasneho adresare pro moduly
		async.apply(commOs.commandExec,{bin: path.join(npm_dir,'npm'),args:['install'], options:{cwd:dir}}, 'NPM INSTALL finished', {err: '', ok:null}),
		async.apply(makeList, dir),
		async.apply(commOs.commandExec,{bin: 'tar', args:['cfj','node_modules.tar.bz2','./node_modules'], options:{cwd:dir}}, 'TAR archive finished', {err:'TAR archive error', ok:null}),
		async.apply(loadSendFile.sendFile, path.join(dir,'/node_modules.tar.bz2'), {response: res, statusCode: 200, contentType: 'application/zip', errorReport: 'Error sending archive'}, {report: 'Archive sent'})
	],
		async.apply(responseToRequest, res, dir)
	);
});
server.listen(port,ip); // Spusteni poslechu serveru

// fs.mkdir

// loadSendFile.loadFile

function checkJSON(dir, cb) {
	console.log('DIR:' +dir);
	var status = fs.statSync(path.join(dir, 'package.json'));
	
	if(status.size<=0) {
		cb('Empty file package.json');
		return;
	}

	// Nasleduje prikaz tvorby adresare
	cb(null,path.join(dir,'node_modules'));
}
	
// fs.mkdir
	
// commOs.commandExec

function makeList(dir, cb) {
	var listStream = fs.createWriteStream(dir + '/node_modules/list.dir', { flags : 'w' });
	dreader.setOutputFunction(function(baseDir,dir){
		listStream.write(dir + '\n');
	});

	listStream.on('error', function(err) {
		if(params.verbose) console.log('Creating list.dir ERROR: ' + err);
		listStream.end();
		cb(err);
	});

	dreader.exploreDir(path.join(dir, 'node_modules'), '', function() {
		if(params.verbose) console.log('MakeList END');
		listStream.end();
		cb(null);
	});
}

// commOs.commandExec

// loadSendFile.sendFile
 
function responseToRequest(res, dir, err) {
	if(err) {
		if(params.verbose) console.log(err);

		res.writeHead(500, {'Content-Type': 'text/plain'});
		res.write('ERROR - ' + err);
	}
	
	cleaning(res, dir);
}

function cleaning(res, dir) { // Mazani docasneho adresare a ukonceni Response
	if(params.verbose) console.log('Cleaning ' + dir);

	rmDir(dir,function(err){
		if(err)
			console.log(err);

		res.end();

		if(params.verbose) console.log('\n------------------ END ------------------\n');
	});
}