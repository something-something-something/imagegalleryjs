const sharp=require('sharp');
const path=require('path');
const fsPromises = require('fs').promises;
async function transformImage(imageModFunctions,imgdir,imgpath){
	//let writeCanvas=imageModFunctions.writeCanvas;
	//let createImage=imageModFunctions.createImage;
	//let createXheightImage=imageModFunctions.createXheightImage;
	//let createXwidthImage=imageModFunctions.createXwidthImage;

	let createDirs=imageModFunctions.createDirs;
	//console.log(createImage);

	let svgtext=Buffer.from(`
		<svg viewBox="0 0 110 30" xmlns="http://www.w3.org/2000/svg">
			<style>
				.theText{
					fill:rgba(0,0,0,0.5);
					font-size:20px;
					font-family:mono;
				}
				.backrect{
					fill:rgba(0,255,255,0.2);
				}
			</style>
			<rect class="backrect" width="100%" height="100%"/>
			<text x="0" y="20" class="theText">Test Text</text>
		</svg>
	`,'utf-8');
	console.log(path.join(imgdir,imgpath));
	
	//let createDirs=
	
	
	sharp(path.join(imgdir,imgpath))
		.resize(null,200)
		.toFile(await createDirs(path.join('testdata/generated/smallimg',imgpath)));

	sharp(path.join(imgdir,imgpath))
		.resize(500,null)
		.toFile(await createDirs(path.join('testdata/generated/medimg',imgpath)));

	sharp(path.join(imgdir,imgpath))
		.composite([{input:svgtext, gravity:'southeast'}])
		.toFile(await createDirs(path.join('testdata/generated/outimg',imgpath)));
	



/*
	writeCanvas('testdata/generated/outimg',imgpath,addText(await createImage(imgdir,imgpath)));
	writeCanvas('testdata/generated/smallimg',imgpath,addText(await createXheightImage(200,imgdir,imgpath)));
	writeCanvas('testdata/generated/medimg',imgpath,addText(await createXwidthImage(500,imgdir,imgpath)));
*/
	// createXheightImage(200,'testdata/smallimg',imgdir,imgpath);
	// createXwidthImage(500,'testdata/medimg',imgdir,imgpath);
}


async function needsRebuild(imageModFunctions,imgdir,imgpath){
	let imageHasChanged=imageModFunctions.imageHasChanged;
	if(await imageHasChanged(imgdir,imgpath)){
		console.log(imgpath+' creating alt files');
		transformImage(imageModFunctions,imgdir,imgpath)
	}
	else{
		console.log(imgpath+' no rebuild');
	}
}

// function addText(imgcanvas){
// 	let ctx=imgcanvas.getContext('2d');
// 	ctx.font='10px serif';
// 	ctx.textAlign='end';
// 	ctx.fillText('Test img',imgcanvas.width-10,imgcanvas.height-10);
// 	return imgcanvas;
// }

module.exports =needsRebuild;