

async function transformImage(imageModFunctions,imgdir,imgpath){
	let writeCanvas=imageModFunctions.writeCanvas;
	let createImage=imageModFunctions.createImage;
	let createXheightImage=imageModFunctions.createXheightImage;
	let createXwidthImage=imageModFunctions.createXwidthImage;

	//console.log(createImage);
	writeCanvas('testdata/generated/outimg',imgpath,addText(await createImage(imgdir,imgpath)));
	writeCanvas('testdata/generated/smallimg',imgpath,addText(await createXheightImage(200,imgdir,imgpath)));
	writeCanvas('testdata/generated/medimg',imgpath,addText(await createXwidthImage(500,imgdir,imgpath)));
	
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

function addText(imgcanvas){
	let ctx=imgcanvas.getContext('2d');
	ctx.font='10px serif';
	ctx.textAlign='end';
	ctx.fillText('Test img',imgcanvas.width-10,imgcanvas.height-10);
	return imgcanvas;
}

module.exports =needsRebuild;