const express = require('express');
const fsPromises = require('fs').promises;
const yaml = require('js-yaml');


	const router = express.Router();

	router.get('/:galleryName', async (req, res, next) => {
		let galleries=req.app.locals.galleries;
		if(galleries.hasOwnProperty( req.params.galleryName)){
			


			let sendObj={
				pageName:galleries[ req.params.galleryName].name,
				content:galleries[ req.params.galleryName].desc,
				type:'gallery',
				galleryId:req.params.galleryName,
				config:req.app.locals.config,
				data:galleries[ req.params.galleryName],
				menu:req.app.locals.menuHtml
			};
			res.render('index',sendObj);


			
			//res.send();
		}
		else{
			next();
		}
		
	});

	router.get('/:galleryName/:itemName', async (req, res, next) => {
		let galleries=req.app.locals.galleries;
		if(galleries.hasOwnProperty( req.params.galleryName)){
			if(galleries[req.params.galleryName].items.hasOwnProperty(req.params.itemName)){
				let sendObj={
					pageName:galleries[req.params.galleryName].items[req.params.itemName].name,
					content:galleries[req.params.galleryName].items[req.params.itemName].desc,
					imgNav:{},
					data:galleries[req.params.galleryName].items[req.params.itemName],
					galleryId:req.params.galleryName,
					type:'galleryItem',
					galleryItemId:req.params.itemName,
					gallery:galleries[req.params.galleryName],
					config:req.app.locals.config,
					menu:req.app.locals.menuHtml
				}

				if(sendObj.gallery.order.indexOf(sendObj.galleryItemId) > 0){
					sendObj.imgNav.previousImg=sendObj.gallery.order[sendObj.gallery.order.indexOf(sendObj.galleryItemId)-1];
				}
				if(sendObj.gallery.order.indexOf(sendObj.galleryItemId) < sendObj.gallery.order.length-1){
					sendObj.imgNav.nextImg=sendObj.gallery.order[sendObj.gallery.order.indexOf(sendObj.galleryItemId)+1];
				}
				res.render('index',sendObj);
			}
			else{
				next();
			}
		}
		else{
			next();
		}
	});









module.exports = router;