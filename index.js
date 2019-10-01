#!/usr/bin/env node
'use strict';
const express = require('express');
const app = express();
const fsPromises = require('fs').promises;
const path = require('path');
const galleryFunctions = require('./util/galleryFunctions');
const pageFunctions = require('./util/pageFunctions');
const fs=require('fs');



function readArgs(args){
	let optionsObj={};

	if(args.length>2){
		for(let i of args){
			if(i.startsWith('--port=')){
				optionsObj.port=i.substring(7)//.valueOf();
			}
			else if(i.startsWith('--config=')){
				optionsObj.configFile=i.substring(9);
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
	galleryImageJsFunctions: './testdata/imgjs/img-mod.js',
	pagesDir: path.join(__dirname,'testdata/pages'),
	homePage:'/page/home',
	imageMountPaths:[
		{
			prefix:'/thumb',
			source:'testdata/smallimg',
			options:{}
		},
		{
			prefix:'/med',
			source:'testdata/medimg',
		},
		{
			prefix:'/full',
			source:'testdata/outimg',
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

async function modifyimages(jsfile, imgdir, imgpath) {
	let dirconArr = await fsPromises.readdir(path.join(imgdir, imgpath), {
		withFileTypes: true
	});

	for (let i of dirconArr) {
		if (i.isDirectory()) {
			modifyimages(jsfile, imgdir, path.join(imgpath, i.name));
		}
		else if (i.isFile()) {
			console.log(path.join(imgpath, i.name));
			if (path.extname(i.name).toLowerCase() === '.png' || path.extname(i.name).toLowerCase() === '.jpeg' || path.extname(i.name).toLowerCase() === '.jpg') {
				let imageMod = require(jsfile);
				imageMod(imgdir, path.join(imgpath, i.name));
			}


		}
	}
}

modifyimages(app.locals.config.galleryImageJsFunctions, app.locals.config.galleryImageDir, '');
console.log('hi');


app.set('views',path.join(app.locals.config.templateDir,'views'));
app.set('view engine','ejs');
app.use('/template/public',express.static(path.join(app.locals.config.templateDir,'public')));


const galleryRouter = require('./routes/gallery');
const pageRouter = require('./routes/page');
app.get('/', async (req, res) => {
	res.redirect(302,app.locals.config.homePage);
});
app.use('/gallery', galleryRouter);
app.use('/page', pageRouter);
for(let i of app.locals.config.imageMountPaths){
	let options={};
	if (i.hasOwnProperty('options')){
		options=i.options;
	}
	
	app.use(i.prefix,express.static(i.source,options));
}



app.listen(app.locals.cliOptions.port||3000, async () => {
	app.locals.galleries = await galleryFunctions.getGalleries(app.locals.config);
	app.locals.menuHtml=await fsPromises.readFile(app.locals.config.menuHtml);

	app.locals.pages=await pageFunctions(app.locals.config);
	console.log('TEST');
})