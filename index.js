#!/usr/bin/env node
'use strict';
const express = require('express');
const app = express();
const fsPromises = require('fs').promises;
const path = require('path');
const galleryFunctions = require('./util/galleryFunctions');
const pageFunctions = require('./util/pageFunctions');
const fs=require('fs');
const imageModFunctions=require('./util/imageModFunctions');
const crypto=require('crypto');

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
	galleryImageJsFunctions:  path.join(__dirname,'testdata/imgjs/img-mod.js'),
	galleryImagesHashFile:"testdata/generated/hash/hashes.json",
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
//TDO cleanup and move image stuff
async function getHashObj(hashFile){
	try{
		let hashFileObj=JSON.parse(await fsPromises.readFile(hashFile,{
			encoding:'utf-8'
		}));
		return hashFileObj;
	}
	catch(e){

		console.log('missing or invalid hash file creating fallback dummy');
		return {

		}
	}
	
}

async function modifyimages(hashObjPromise,jsfile, imgdir, imgpath) {
	let hashObj=await hashObjPromise;
	let dirconArr = await fsPromises.readdir(path.join(imgdir, imgpath), {
		withFileTypes: true
	});
	let arrOfImages=[];
	for (let i of dirconArr) {
		if (i.isDirectory()) {
			arrOfImages.push(modifyimages(hashObj,jsfile, imgdir, path.join(imgpath, i.name)));
		}
		else if (i.isFile()) {
			arrOfImages.push(path.join(imgpath, i.name));
			console.log(path.join(imgpath, i.name));
			if (path.extname(i.name).toLowerCase() === '.png' || path.extname(i.name).toLowerCase() === '.jpeg' || path.extname(i.name).toLowerCase() === '.jpg') {
				let imageMod = require(path.resolve(jsfile));
				imageMod(imageModFunctions(app.locals.config,hashObj),imgdir, path.join(imgpath, i.name));
			}
		}
	}
	return arrOfImages
}

let nestedPromiseImgArrays = modifyimages(getHashObj(app.locals.config.galleryImagesHashFile),app.locals.config.galleryImageJsFunctions, app.locals.config.galleryImageDir, '');
async function getImageList(nestedImageArrays) {
	let img = await nestedImageArrays;
	let arr=[];
	for(let i of img){
		let z= await i;
		if(Array.isArray(z)){
			arr.push(...await getImageList(z));
		}
		else{
			arr.push(z);
		}
	}
	
	return arr;
}
async function makeJsonHashFile(npia){
	let images=await getImageList(npia);
	//console.log(images);
	let obj={
		imgFiles:{},

	}
	{
		let sha256=crypto.createHash('sha256');
		sha256.update(await fs.promises.readFile(app.locals.config.galleryImageJsFunctions));
		obj.jsFunc=sha256.digest('hex');
	}
	for( let i of images){
		let imgPath=path.join(app.locals.config.galleryImageDir,i);
		
		let sha256=crypto.createHash('sha256');
		sha256.update(await fs.promises.readFile(imgPath));

		obj.imgFiles[i]=sha256.digest('hex');
	}
	//console.log(obj);
	await fsPromises.mkdir(path.dirname(app.locals.config.galleryImagesHashFile),{
		recursive:true
	});
	fsPromises.writeFile(app.locals.config.galleryImagesHashFile,JSON.stringify(obj));
};
makeJsonHashFile(nestedPromiseImgArrays);



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
})