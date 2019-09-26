'use strict';
const express=require('express');
const app=express();
const fsPromises=require('fs').promises;
const path=require('path');


app.locals.config={
	galleryDescriptionsDir:'testdata/galleries',
	galleryItemsDir:'testdata/galleryItems',
	galleryImageDir:'testdata/images',
	galleryImageJsFunctions:'./testdata/imgjs/img-mod.js'
};


async function modifyimages(jsfile,imgdir,imgpath){
	let dirconArr=await fsPromises.readdir(path.join(imgdir,imgpath),{
		withFileTypes:true
	});

	for (let i of dirconArr){
		if(i.isDirectory()){
			modifyimages(jsfile,imgdir,path.join(imgpath,i.name));
		}
		else if(i.isFile()){
			console.log(path.join(imgpath,i.name));
			if(path.extname(i.name).toLowerCase()==='.png'||path.extname(i.name).toLowerCase()==='.jpeg'||path.extname(i.name).toLowerCase()==='.jpg'){
				let imageMod=require(jsfile);
				imageMod(imgdir,path.join(imgpath,i.name));
			}


		}
	}
}

modifyimages(app.locals.config.galleryImageJsFunctions,app.locals.config.galleryImageDir,'');
console.log('hi');
const galleryRouter=require('./routes/gallery');
app.get('/',async (req,res)=>{
	res.send('HOME');
});
app.use('/gallery',galleryRouter);

app.listen(3000,()=>{
	console.log('TEST');
})