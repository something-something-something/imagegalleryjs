const fsPromises = require('fs').promises;
const path = require('path');

const imageModFunctions=require('./imageModFunctions');
const crypto=require('crypto');

//TDO cleanup and rename stuff
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

async function modifyimages(app,hashObjPromise,jsfile, imgdir, imgpath) {
	let hashObj=await hashObjPromise;
	let dirconArr = await fsPromises.readdir(path.join(imgdir, imgpath), {
		withFileTypes: true
	});
	let arrOfImages=[];
	for (let i of dirconArr) {
		if (i.isDirectory()) {
			arrOfImages.push(modifyimages(app,hashObj,jsfile, imgdir, path.join(imgpath, i.name)));
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

async function makeJsonHashFile(app,npia){
	let images=await getImageList(npia);
	//console.log(images);
	let obj={
		imgFiles:{}

	};
	{
		let sha256=crypto.createHash('sha256');
		sha256.update(await fsPromises.readFile(app.locals.config.galleryImageJsFunctions));
		obj.jsFunc=sha256.digest('hex');
	}
	for( let i of images){
		let imgPath=path.join(app.locals.config.galleryImageDir,i);
		
		let sha256=crypto.createHash('sha256');
		sha256.update(await fsPromises.readFile(imgPath));

		obj.imgFiles[i]=sha256.digest('hex');
	}
	//console.log(obj);
	await fsPromises.mkdir(path.dirname(app.locals.config.galleryImagesHashFile),{
		recursive:true
	});
	fsPromises.writeFile(app.locals.config.galleryImagesHashFile,JSON.stringify(obj));
};

async function doImages(app){
	let nestedPromiseImgArrays = modifyimages(app,
		getHashObj(app.locals.config.galleryImagesHashFile),
		app.locals.config.galleryImageJsFunctions,
		app.locals.config.galleryImageDir,
		''
		);

	makeJsonHashFile(app,nestedPromiseImgArrays);
	cleanImgDirs(app,await getImageList(nestedPromiseImgArrays));
}
async function cleanImgDirs(app,wandtedFiles){
	if(app.locals.cliOptions.hasOwnProperty('rmOldImages')){
		let actualRm=app.locals.cliOptions.rmOldImages==='yes';
		for(let i of app.locals.config.imageDirsToClean){
			console.log('cleaning '+i)
			cleanDirRec(wandtedFiles,i,'',actualRm);
		}
	}
	else{
		console.log('run with --rm-old-images=yes to remove images that are no longer relavent or --rm-old-images=dry to see test result');
	}
}
async function cleanDirRec(wandtedFiles,targetDir,currPath,actualRm){
	let dirCon=[];
	try{
		dirCon=await fsPromises.readdir(path.join(targetDir,currPath),{
			withFileTypes: true
		});
	}
	catch(e){
		console.log(e);
		console.log(targetDir+' Does not exist not deleting files');
	}
	
	for(let i of dirCon){
		if(i.isDirectory()){
			cleanDirRec(wandtedFiles,targetDir,path.join(currPath,i.name),actualRm);
		}
		else if(i.isFile()){
			if(wandtedFiles.indexOf(path.join(currPath,i.name))>-1){
				//console.log(path.join(currPath,i.name)+ ' Okay no deletion');
			}
			else{
				let fileToDelete=path.join(targetDir,currPath,i.name);
				console.log(' DELETED! '+fileToDelete);
				if(actualRm){
					fsPromises.unlink(fileToDelete);
				}
				
			}
		}
	}
}

module.exports={
	makeJsonHashFile:makeJsonHashFile,
	getImageList:getImageList,
	getHashObj:getHashObj,
	modifyimages:modifyimages,
	doImages:doImages,
	cleanImgDirs:cleanImgDirs
}