const fsPromises = require('fs').promises;
const yaml = require('js-yaml');
const path = require('path');


async function getGalleries(config){

	let galleries={};
	let galleryDirEntries=await fsPromises.readdir(config.galleryDescriptionsDir,{withFileTypes:true});
	for (i of galleryDirEntries){
		if(i.isFile()&& path.extname(i.name)==='.yaml'){
			galleries[path.basename(i.name,'.yaml')]=await getGallery(config,path.basename(i.name,'.yaml'));
		}
	}

	return  galleries
}

async function getGallery(config,gName){
	let gallery={};
	
	gallery = yaml.safeLoad(await fsPromises.readFile(path.join(config.galleryDescriptionsDir, gName + '.yaml')));
	gallery.items= await getGalleryItems(config,gName);
	gallery.order=orderItems(gallery);
	return gallery;
	

}
async function getGalleryItems(config,gName){

	galleryItems={};
	let galleryItemDirEntries=[];
	try{
		galleryItemDirEntries=await fsPromises.readdir(path.join(config.galleryItemsDir, gName),{withFileTypes:true});
	}
	catch(e){
		console.log(e);
	}
	for (i of galleryItemDirEntries){
		if(i.isFile()&& path.extname(i.name)==='.yaml'){
			galleryItems[path.basename(i.name,'.yaml')]= yaml.safeLoad(await fsPromises.readFile(path.join(config.galleryItemsDir , gName ,i.name)));
		}
	}

	return galleryItems;

}



function orderItems(gallery){
	let order=Object.keys(gallery.items).sort((a,b)=>{
		if(gallery.items[a].hasOwnProperty('priority')){
			if(gallery.items[b].hasOwnProperty('priority')){
				return gallery.items[b].priority-gallery.items[a].priority
			}
			else{
				return -1;
			}
		}
		else if(gallery.items[b].hasOwnProperty('priority')){
			return 1;
		}
		else{
			if(a < b){
				return -1
			}
			else if(b < a){
				return 1;
			}
			else{
				return 0;
			}
		}

	});
	return order
}

module.exports={
	getGalleries:getGalleries
}