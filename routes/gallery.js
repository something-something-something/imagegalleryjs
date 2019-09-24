const express = require('express');
const fsPromises = require('fs').promises;
const yaml = require('js-yaml');


	const router = express.Router();

	router.get('/:galleryName', async (req, res, next) => {
		let config=req.app.locals.config;
		console.log(config)
		let gallery = {};
		try {
			gallery = yaml.safeLoad(await fsPromises.readFile(config.galleryDescriptionsDir + '/' + req.params.galleryName + '.yaml'));
			console.log('SUCESS');
		}
		catch (e) {
			console.log('FAILED');
			next();
			return;
		}

		res.send(gallery);
	});

	router.get('/:galleryName/:itemName', async (req, res, next) => {
		let config=req.app.locals.config;

		console.log(config)
		let gallery = {};
		try {
			gallery = yaml.safeLoad(await fsPromises.readFile(config.galleryItemsDir + '/' + req.params.galleryName + '/'+req.params.itemName +'.yaml'));
			console.log('SUCESS');
		}
		catch (e) {
			console.log('FAILED');
			next();
			return;
		}

		res.send(gallery);
	});









module.exports = router;