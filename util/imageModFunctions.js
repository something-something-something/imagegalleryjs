const {loadImage,createCanvas}=require('canvas');
const path=require('path');

const fsPromises=require('fs').promises;
const fs=require('fs');
const nodeCanvas=require('canvas');
const crypto=require('crypto');

async function createImage(imgdir,imgpath){

	let img=await loadImage(path.join(imgdir,imgpath));

	let imgcanvas=createCanvas(img.width,img.height);

	let ctx=imgcanvas.getContext('2d');

	ctx.drawImage(img,0,0);
	return imgcanvas;
}

async function createXwidthImage(xwidth,imgdir,imgpath){

	let img=await loadImage(path.join(imgdir,imgpath));

	let imgcanvas=createCanvas((xwidth/img.width)*img.width,(xwidth/img.width)*img.height);

	let ctx=imgcanvas.getContext('2d');

	ctx.drawImage(img,0,0,(xwidth/img.width)*img.width,(xwidth/img.width)*img.height);
	return imgcanvas;


}

async function createXheightImage(xheight,imgdir,imgpath){
	let img=await loadImage(path.join(imgdir,imgpath));

	let imgcanvas=createCanvas((xheight/img.height)*img.width,(xheight/img.height)*img.height);

	let ctx=imgcanvas.getContext('2d');

	ctx.drawImage(img,0,0,(xheight/img.height)*img.width,(xheight/img.height)*img.height);
	return imgcanvas;
}


async function writeCanvas(targetdir,imgpath,imgcanvas){
	await fsPromises.mkdir(path.join(targetdir,path.dirname(imgpath)),{
		recursive:true
	});
	//let imgwrite=fs.createWriteStream(path.join(targetdir,imgpath));
	let imgBuff;
	//let imgStream;
	if(path.extname(imgpath).toLowerCase()==='.jpg'||path.extname(imgpath).toLowerCase()==='.jpeg'){
		//console.log('jpg');
		//imgStream=imgcanvas.createJPEGStream({quality:1});
		imgBuff=imgcanvas.toBuffer('image/jpeg',{quality:1})
	}
	else if(path.extname(imgpath).toLowerCase()==='.png'){
		//console.log('png');
		//imgStream=imgcanvas.createPNGStream();
		imgBuff=imgcanvas.toBuffer('image/png')
	}
	else{
		//console.log('none');
		return;
	}
	await fsPromises.writeFile(path.join(targetdir,imgpath),imgBuff);
	//imgStream.pipe(imgwrite);
	//imgwrite.on('finish',()=>{
		//console.log('done')
	//});
}
function buildImageHasChanged(config,hashObj){

	let imageHasChanged=async function(imgdir,imgpath){
		//TODO cleanup
		if(!hashObj.hasOwnProperty('imgFiles')){
			return true;
		}
		else if(!hashObj.hasOwnProperty('jsFunc')){
			return true;
		}
		else if(!hashObj.imgFiles.hasOwnProperty(imgpath)){
			return true;
		}
		else if(hashObj.imgFiles.hasOwnProperty(imgpath)&&hashObj.hasOwnProperty('jsFunc')){
			let sha256img=crypto.createHash('sha256');
			sha256img.update(await fsPromises.readFile(path.join(imgdir,imgpath)))
			let sha256js=crypto.createHash('sha256');
			sha256js.update(await fsPromises.readFile(config.galleryImageJsFunctions));

			if(sha256img.digest('hex')===hashObj.imgFiles[imgpath]&&sha256js.digest('hex')===hashObj.jsFunc){
				return false;
			}
			else {
				return true;
			}
		}
		else{
			return true
		}

	}
	return imageHasChanged;
}



function exportBuilder(config,hashObj) {
	
	return {
		imageHasChanged:buildImageHasChanged(config,hashObj),
		createXwidthImage: createXwidthImage,
		createXheightImage: createXheightImage,
		createImage: createImage,
		writeCanvas: writeCanvas,
		nodeCanvas: nodeCanvas
	};
}
module.exports=exportBuilder;