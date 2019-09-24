'use strict';
const express=require('express');
const app=express();

app.locals.config={
	galleryDescriptionsDir:'testdata/galleries',
	galleryItemsDir:'testdata/galleryItems'
};


const galleryRouter=require('./routes/gallery');
app.get('/',async (req,res)=>{
	res.send('HOME');
});
app.use('/gallery',galleryRouter);

app.listen(3000,()=>{
	console.log('TEST');
})