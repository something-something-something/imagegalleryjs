'use strict';
const express = require('express');
const app = express();
const fsPromises = require('fs').promises;
const path = require('path');
const galleryFunctions = require('./util/galleryFunctions');

app.locals.config = {
	siteName:'Test Gallery',
	galleryDescriptionsDir: 'testdata/galleries',
	galleryItemsDir: 'testdata/galleryItems',
	galleryImageDir: 'testdata/images',
	galleryImageJsFunctions: './testdata/imgjs/img-mod.js',
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
	templateDir:'testdata/template',
	menuHtml:'testdata/menu.html'
};

app.locals.menuHtml = {}
app.locals.galleries = {}





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
app.get('/', async (req, res) => {
	res.send('HOME');
});
app.use('/gallery', galleryRouter);
for(let i of app.locals.config.imageMountPaths){
	let options={};
	if (i.hasOwnProperty('options')){
		options=i.options;
	}
	
	app.use(i.prefix,express.static(i.source,options));
}



app.listen(3000, async () => {
	app.locals.galleries = await galleryFunctions.getGalleries(app.locals.config);
	app.locals.menuHtml=await fsPromises.readFile(app.locals.config.menuHtml);
	console.log('TEST');
})