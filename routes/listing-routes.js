const express = require('express');
const router  = express.Router();

const Listing    = require('../models/Listing');

const uploadMagic = require('../config/cloundinary-setup');



router.get('/listings', (req, res, next)=>{

  Listing.find().populate('author')
  .then((allTheListings)=>{
    allTheListings.reverse();
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





router.get('/listing-views/details/:id', (req,res,next)=>{

  let theId = req.params.id;
  Listing.findById(theId).populate('author')
  .then((oneSingleListing)=>{
    // console.log(oneSingleListing);
    // console.log(req.user);

    if(req.user){
      if(oneSingleListing.author._id.equals(req.user._id)){
        // console.log("ownedddddd")
        oneSingleListing.owned = true;
        res.render('listing-views/listing-details', {theListing: 
          oneSingleListing})
      }
    }
    
    


    res.render('listing-views/listing-details', {theListing: 
      oneSingleListing})
  })
  .catch((err)=>{
    next(err);
  })
})







router.get('/listings/add-new', (req, res, next)=>{

  if(!req.user){
      req.flash('error', 'You must be logged in to create a new listings')
      res.redirect('/login')
  }
  else{
    res.render('listing-views/add-listing')
  }


})



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

/*Edit Listing*/
router.get('/listings/edit/:id', (req, res, next)=>{
  Listing.findById(req.params.id)
  .then((theListing)=>{
          res.render('listing-views/edit-listing', {listing: theListing})
  })
  .catch((err)=>{
      next(err);
  })
})



// if(req.file !== undefined){
//   theImg = req.file.url;
// }

// const {theTitle, theDescription, thePrice} = req.body;
//   let theImg = "https://i.pinimg.com/236x/fc/7e/ce/fc7ece8e8ee1f5db97577a4622f33975--photo-icon-sad.jpg";
//   if(req.file !== undefined){
//     theImg = req.file.url;
//   }


router.post('/listings/update/:listingID',uploadMagic.single('thePic'),(req, res, next)=>{
  let theID = req.params.listingID;
  if(req.file !== undefined){
    theImg = req.file.url;
  }





  console.log('------',req.body);
  console.log("******",req.file);
  
  // console.log("*******",theID);
  Listing.findByIdAndUpdate(theID, req.body, req.file)
  .then((listing)=>{
    console.log("It worked");
    console.log(theID);
      res.redirect('/listing-views/details/'+theID)
  })
  .catch((err)=>{
    console.log("didnt work :(")
      next(err);
  })
})








module.exports = router;



