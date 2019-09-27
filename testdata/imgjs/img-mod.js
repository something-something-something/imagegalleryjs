const {loadImage,createCanvas}=require('canvas');
const path=require('path');

const fsPromises=require('fs').promises;
const fs=require('fs');

async function transformImage(imgdir,imgpath){
	createImageWithText(imgdir,imgpath);
	createXheightImage(200,'testdata/smallimg',imgdir,imgpath);
	createXwidthImage(500,'testdata/medimg',imgdir,imgpath);
}


async function createImageWithText(imgdir,imgpath){
	let targetdir='testdata/outimg';
	let img=await loadImage(path.join(imgdir,imgpath));
	
	let imgcanvas=createCanvas(img.width,img.height);

	let ctx=imgcanvas.getContext('2d');

	ctx.drawImage(img,0,0);
	ctx.font='10px serif';
	ctx.textAlign='end';
	ctx.fillText('Test img',imgcanvas.width-10,imgcanvas.height-10);

	writeCanvas(targetdir,imgpath,imgcanvas);
}

async function createXwidthImage(xwidth,targetdir,imgdir,imgpath){

	let img=await loadImage(path.join(imgdir,imgpath));
	
	let imgcanvas=createCanvas((xwidth/img.width)*img.width,(xwidth/img.width)*img.height);

	let ctx=imgcanvas.getContext('2d');

	ctx.drawImage(img,0,0,(xwidth/img.width)*img.width,(xwidth/img.width)*img.height);
	ctx.font='10px serif';
	ctx.textAlign='end';
	ctx.fillText('Test img',imgcanvas.width-10,imgcanvas.height-10);

	writeCanvas(targetdir,imgpath,imgcanvas);

	
}

async function createXheightImage(xheight,targetdir,imgdir,imgpath){

	let img=await loadImage(path.join(imgdir,imgpath));
	
	let imgcanvas=createCanvas((xheight/img.height)*img.width,(xheight/img.height)*img.height);

	let ctx=imgcanvas.getContext('2d');

	ctx.drawImage(img,0,0,(xheight/img.height)*img.width,(xheight/img.height)*img.height);
	ctx.font='10px serif';
	ctx.textAlign='end';
	ctx.fillText('Test img',imgcanvas.width-10,imgcanvas.height-10);

	writeCanvas(targetdir,imgpath,imgcanvas);

	
}


async function writeCanvas(targetdir,imgpath,imgcanvas){
	await fsPromises.mkdir(path.join(targetdir,path.dirname(imgpath)),{
		recursive:true
	});
	let imgwrite=fs.createWriteStream(path.join(targetdir,imgpath));

	let imgStream;
	if(path.extname(imgpath).toLowerCase()==='.jpg'||path.extname(imgpath).toLowerCase()==='.jpeg'){
		console.log('jpg');
		imgStream=imgcanvas.createJPEGStream({quality:1});
	}
	else if(path.extname(imgpath).toLowerCase()==='.png'){
		console.log('png');
		imgStream=imgcanvas.createPNGStream();
	}
	else{
		console.log('none');
		return;
	}
	imgStream.pipe(imgwrite);
	imgwrite.on('finish',()=>{
		console.log('done')
	});
}


module.exports =transformImage;