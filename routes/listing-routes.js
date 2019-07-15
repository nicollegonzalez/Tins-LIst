const express = require('express');
const router  = express.Router();

const Listing    = require('../models/Listing');

const uploadMagic = require('../config/cloundinary-setup');



router.get('/listings', (req, res, next)=>{

  Listing.find().populate('author')
  .then((allTheListings)=>{
    //checking if user already exist 
    if(req.user){
    
    allTheListings.forEach((eachListing)=>{
      console.log('its a listing')

        if(eachListing.author._id.equals(req.user._id)){
            eachListing.owned = true;
        }

    })

    }

    res.render('listing-views/all-the-listings', {listings: allTheListings})
  })
  .catch((err)=>{
      next(err)
  })
})




router.get('/listings/add-new', (req, res, next)=>{

  if(!req.user){
      req.flash('error', 'must be logged in to make listings')
      res.redirect('/login')
  }
  else{
    res.render('listing-views/add-listing')
  }


})


// router.post('/celebrities/create-new-celebrity',uploadMagic.single('thePic'),(req,res,next)=>{
router.post('/listings/create-new',uploadMagic.single('thePic'),(req, res, next)=>{
// router.post('/listings/create-new',(req, res, next)=>{

  // let theTitle = req.body.theTitle;
  // let theDescription = req.body.theDescription;
  const {theTitle, theDescription, thePrice} = req.body;
  const theAuthor  = req.user._id;
  let theImg = "https://i.pinimg.com/236x/fc/7e/ce/fc7ece8e8ee1f5db97577a4622f33975--photo-icon-sad.jpg";
  if(req.file !== undefined){
    theImg = req.file.url;
  }
  
  console.log(theTitle);
  console.log(theDescription);
  console.log(theAuthor);


  Listing.create({
      title: theTitle,
      image: theImg,
      description: theDescription,
      price: thePrice,
      author: theAuthor
  })
  .then(()=>{
      req.flash('error', 'listing successfully created')
      res.redirect('/listings')

  })
  .catch((err)=>{
      next(err)
  })
})



router.post('/listings/delete/:idOfListing', (req, res, next)=>{
  Listing.findByIdAndRemove(req.params.idOfListing)
  .then(()=>{
      req.flash('error', 'LISTING SUCCESSFULLY DELETED!')
      res.redirect('/listings')
  })
  .catch((err)=>{
      next(err)
  })

})


module.exports = router;