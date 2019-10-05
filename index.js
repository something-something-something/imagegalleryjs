#!/usr/bin/env node
'use strict';
const express = require('express');
const app = express();
const fsPromises = require('fs').promises;
const path = require('path');
const galleryFunctions = require('./util/galleryFunctions');
const pageFunctions = require('./util/pageFunctions');
const imageFunctions=require('./util/imageFunctions');
const fs=require('fs');


function readArgs(args){
	let optionsObj={};

	if(args.length>2){
		let realArgs=args.slice(2);
		for(let i of realArgs){
			if(i.startsWith('--port=')){
				optionsObj.port=i.substring(7);//.valueOf();
			}
			else if(i.startsWith('--host=')){
				optionsObj.host=i.substring(7);
			}
			else if(i.startsWith('--config=')){
				optionsObj.configFile=i.substring(9);
			}
			else if(i.startsWith('--rm-old-images=')){
				let op=i.substring(16)
				if(op==='yes'||op==='dry'){
					optionsObj.rmOldImages=i.substring(16);
				}
				else{
					console.log('--rm-old-images= must be yes or dry see --help');
					process.exit();
				}
			}
			else if(i=='--help'){
				let helpArr=[
					{
						arg:'--port=<PORTNUM>',
						text:'where <PORTNUM> is the port to listen on'
					},
					{
						arg:'--host=<HOST>',
						text:'<HOST> is host (like localhost 127.0.0.1 etc)'
					},
					{
						arg:'--config=<CONFIGFILE>',
						text:'where CONFIGFILE is the configuration file'
					},
					{
						arg:'--rm-old-images=<RMOPTION>',
						text:['<RMOPTION> can be \x1b[38;2;255;50;50m\x1b[48;2;55;55;55myes\x1b[0m or \x1b[38;2;50;250;50m\x1b[48;2;55;55;55mdry\x1b[0m',
						'  \x1b[38;2;255;50;50m\x1b[48;2;55;55;55myes\x1b[0m means actualy delete the files',
						'  \x1b[38;2;50;250;50m\x1b[48;2;55;55;55mdry\x1b[0m just outputs like files were deleted (dry run)']
					},
					{
						arg:'--help',
						text:'this help text'
					}
					
				]
				//console.log(helpText);
				console.log('\n\x1b[1mArguments\x1b[0m\n')
				console.group();
				for(let x of helpArr){
					console.log('\x1b[1m\x1b[38;2;0;220;100m\x1b[48;2;55;55;55m '+x.arg+' \x1b[0m');
					console.group();
					if(Array.isArray(x.text)){
						for(let y of x.text){
							console.log(y);
						}
					}
					else{
						console.log(x.text);
					}
					console.groupEnd();
					console.log();
					
				}
				process.exit();
			}
			else{
				
				console.log('\x1b[1m\x1b[38;2;255;20;0m\x1b[48;2;0;0;20m '+i+'\x1b[0m IS NOT RECOGNIZED');
				process.exit();
			}
		}
	}
	return optionsObj;
}

app.locals.cliOptions=readArgs(process.argv);


console.log(app.locals.cliOptions);

app.locals.config={};

if(app.locals.cliOptions.configFile!==undefined){
	app.locals.config=JSON.parse(fs.readFileSync(app.locals.cliOptions.configFile));
}
console.log("__dirname"+__dirname);
let defaultConfig = {
	siteName:'Test Gallery',
	galleryDescriptionsDir: path.join(__dirname,'testdata/galleries'),
	galleryItemsDir:  path.join(__dirname,'testdata/galleryItems'),
	galleryImageDir:  path.join(__dirname,'testdata/images'),
	galleryImageJsFunctions:  path.join(__dirname,'testdata/imgjs/img-mod.js'),
	galleryImagesHashFile:"testdata/generated/hash/hashes.json",
	imageDirsToClean:[
		'testdata/generated/smallimg',
		'testdata/generated/medimg',
		'testdata/generated/outimg'
	],
	pagesDir: path.join(__dirname,'testdata/pages'),
	homePage:'/page/home',
	imageMountPaths:[
		{
			prefix:'/thumb',
			source:'testdata/generated/smallimg',
			options:{}
		},
		{
			prefix:'/med',
			source:'testdata/generated/medimg',
		},
		{
			prefix:'/full',
			source:'testdata/generated/outimg',
		}
	],
	templateDir: path.join(__dirname,'testdata/template'),
	menuHtml: path.join(__dirname,'testdata/menu.html')
};

for(let i of Object.keys(defaultConfig)){
	if(!app.locals.config.hasOwnProperty(i)){
		app.locals.config[i]=defaultConfig[i];
	}
}


app.locals.menuHtml = {};
app.locals.galleries = {};
app.locals.pages={};

imageFunctions.doImages(app);

app.set('views',path.join(app.locals.config.templateDir,'views'));
app.set('view engine','ejs');
app.use('/template/public',express.static(path.join(app.locals.config.templateDir,'public')));


const galleryRouter = require('./routes/gallery');
const pageRouter = require('./routes/page');
app.get('/', async (req, res) => {
	res.redirect(302,app.locals.config.homePage);
});

function writeLog(req,res,next){
	let time=new Date();
	console.log(time.toLocaleString()+' '+req.originalUrl);
	next();
}


app.use(writeLog);

app.use('/gallery', galleryRouter);
app.use('/page', pageRouter);
for(let i of app.locals.config.imageMountPaths){
	let options={};
	if (i.hasOwnProperty('options')){
		options=i.options;
	}
	
	app.use(i.prefix,express.static(i.source,options));
}



app.listen(app.locals.cliOptions.port||3000, app.locals.cliOptions.host||'127.0.0.1',async () => {
	app.locals.galleries = await galleryFunctions.getGalleries(app.locals.config);
	app.locals.menuHtml=await fsPromises.readFile(app.locals.config.menuHtml);
	app.locals.pages=await pageFunctions(app.locals.config);
})