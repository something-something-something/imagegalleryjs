const fsPromises = require('fs').promises;
const yaml = require('js-yaml');
const path = require('path');

async function getPages(config){

	let pages={};
	let pageDirEntries=await fsPromises.readdir(config.pagesDir,{withFileTypes:true});
	for (i of pageDirEntries){
		if(i.isFile()&& path.extname(i.name)==='.yaml'){
			pages[path.basename(i.name,'.yaml')]=yaml.safeLoad(await fsPromises.readFile(path.join(config.pagesDir ,i.name)));
		}
	}
	return pages;
}

module.exports=getPages