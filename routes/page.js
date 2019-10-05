const express = require('express');
const fsPromises = require('fs').promises;
const yaml = require('js-yaml');


	const router = express.Router();

	router.get('/:pageId', async (req, res, next) => {
		let pages=req.app.locals.pages;
		if(pages.hasOwnProperty( req.params.pageId)){
				let sendObj={
				pageName:pages[ req.params.pageId].name,
				content:pages[ req.params.pageId].content,
				type:'page',
				pageId:req.params.pageId,
				config:req.app.locals.config,
				data:pages[ req.params.pageId],
				menu:req.app.locals.menuHtml
			};
			res.render('index',sendObj);
		}
		else{
			next();
		}
		
	});

module.exports = router;