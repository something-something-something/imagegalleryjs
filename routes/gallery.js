const express = require('express');
const fsPromises = require('fs').promises;
const yaml = require('js-yaml');


	const router = express.Router();

	router.get('/:galleryName', async (req, res, next) => {
		let galleries=req.app.locals.galleries;
		if(galleries.hasOwnProperty( req.params.galleryName)){
			res.send(galleries[ req.params.galleryName]);
		}
		else{
			next();
		}
		
	});

	router.get('/:galleryName/:itemName', async (req, res, next) => {
		let galleries=req.app.locals.galleries;
		if(galleries.hasOwnProperty( req.params.galleryName)){
			if(galleries[req.params.galleryName].items.hasOwnProperty(req.params.itemName)){
				res.send({
						name:req.params.itemName,
						item:galleries[req.params.galleryName].items[req.params.itemName],
						gallery:galleries[req.params.galleryName]
					});
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