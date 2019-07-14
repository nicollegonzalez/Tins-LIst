const express = require('express');
const router  = express.Router();

const Listing    = require('../models/Listing');



router.get('/listings', (req, res, next)=>{

  Listing.find().populate('author')
  .then((allTheListings)=>{
      //checking if user already exist 
      if(req.user){
      
      allTheListings.forEach((eachListing)=>{

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

  res.render('listing-views/add-listing')

})



router.post('/listings/create-new', (req, res, next)=>{

  let newTitle = req.body.theTitle;
  let newDescription = req.body.theDescription;
  let newAuthor  = req.user._id;

  Listing.create({
      title: newTitle,
      description: newDescription,
      author: newAuthor
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