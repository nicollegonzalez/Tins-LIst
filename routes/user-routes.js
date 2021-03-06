const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const User    = require('../models/User');
const Listing    = require('../models/Listing');
const passport = require('passport');
const LocalStrategy = require("passport-local").Strategy;

const uploadMagic = require('../config/cloundinary-setup');



router.get('/signup', (req, res, next)=>{
  if(!req.user){
    res.render('user-views/signup');
  }
  else{
    req.flash('error', `You already have a user profile.`)
    res.redirect('/profile')
  }

})



router.post('/signup', (req, res, next)=>{

  const thePassword = req.body.password;
  const theUsername = req.body.username;
  const email       = req.body.email

  const salt = bcrypt.genSaltSync(12);
  const hashedPassWord =  bcrypt.hashSync(thePassword, salt);
  
  User.findOne({email}, (err, user) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      User.create({
        username: theUsername,
        password: hashedPassWord,
        email: email,
        leftListings: [],
        rigthListings: []

      })
      .then((user)=>{
          // console.log('yay created a new user');
          // console.log(user);
          req.login(user, function(err) {
            req.flash('error', `New User successfully created.`)
            res.redirect('/profile')
          });
      })
      .catch((err)=>{
          next(err);
      })
    }else if (user) {
        req.flash('error', "We found a user with that email. Try Loging in with your username or with Google.")
        res.redirect('/login')
    }else{
      res.render('user-views/profile') 
    }
      
  });
})



router.get('/login', (req, res, next)=>{
  if(!req.user){
    res.render('user-views/login');
  }
  else{
    req.flash('error', `You are already logged into your user profile.`)
    res.redirect('/profile')
  }

})



router.post("/login", passport.authenticate("local", {
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true,
  passReqToCallback: true
}));

router.get('/logout', (req, res, next)=>{
  req.logout()
  res.redirect("/login")
})


//For google authenticate
router.get("/auth/google", passport.authenticate("google", {
  scope: ["https://www.googleapis.com/auth/plus.login",
          "https://www.googleapis.com/auth/userinfo.email"
      ]
}));


router.get("/auth/google/callback", passport.authenticate("google", {
  failureRedirect: "/",
  successRedirect: "/profile"
}));

//Profiles route
router.get('/profile',(req, res, next)=>{
  if(!req.user){
    req.flash('error', "You must be logged in to view your profile page")
    res.redirect('/login')
  }
  else(
    // res.render('user-views/profile')
    User.find()
    .then((allTheListings)=>{
      // console.log(req.user)
      Listing.find().populate('author')
      .then((allTheListings)=>{
        // console.log("******", allTheListings);
        allTheListings.forEach((eachListing)=>{
          // console.log('its a listing')
          // console.log('asdasdasdasdasdasdasdasdadsasdasd')
          // console.log(req.user)
          if(eachListing.author._id.equals(req.user._id)){
            eachListing.owned = true;
          }
        })
        res.render('user-views/profile', {listings: allTheListings, user: req.user})
      })
      .catch((err)=>{
        next(err);
      })
    })
    .catch((err)=>{
      next(err);
    })
  )
})



// //Delete User

// router.post('/user/delete/:idOfUser', (req, res, next)=>{
//   Listing.findByIdAndRemove(req.params.idOfUser)
//   .then(()=>{
//       req.flash('error', 'LISTING SUCCESSFULLY DELETED!')
//       res.redirect('/listings')
//   })
//   .catch((err)=>{
//       next(err)
//   })

// })



/*Edit User*/
router.get('/user/edit/:id', (req, res, next)=>{
  User.findById(req.params.id)
  .then((theUser)=>{
          res.render('user-views/edit-user-profile', {user: theUser})
  })
  .catch((err)=>{
      next(err);
  })
})

router.post('/user/update/:userID',uploadMagic.single('theUserPic'),(req, res, next)=>{
  let theID = req.params.userID;
  console.log('------',req.body);
  // console.log("*******",theID);
  User.findByIdAndUpdate(theID, req.body, req.file)
  .then((listing)=>{
    console.log("It worked");
    console.log(theID);
      res.redirect('/profile')
  })
  .catch((err)=>{
    console.log("didnt work :(")
      next(err);
  })
})



/*User Personalized Feed */
router.get('/feed', (req, res, next)=>{

  // Listing.find().populate('author')
  // .then((allTheListings)=>{
  //   // console.log("*****1",allTheListings[0],"*****1");
  //   allTheListings.reverse();
  //   // console.log("*****last",allTheListings[0],"*****last");
    

  //   //checking if user already exist 
  //   if(req.user){
  //   // Change forEach into a for loop going in reverse to display newest listings
  //   allTheListings.forEach((eachListing)=>{
  //     console.log('its a listing');

  //       if(eachListing.author._id.equals(req.user._id)){
  //           eachListing.owned = true;
  //       }

  //   })

  //   }

  //   res.render('user-views/feed', {listings: allTheListings})
  // })
  // .catch((err)=>{
  //     next(err)
  // })


  Listing.find().populate('author')
  .then((allTheListings)=>{
    // console.log("*****1",allTheListings[0],"*****1");
    allTheListings.reverse();
    // console.log("*****last",allTheListings[0],"*****last");
    
    let allTheListingsIDs = [];

    allTheListings.forEach((eachListing)=>{
      allTheListingsIDs.push(eachListing._id);
    })

    let allActiveListingIDs = allTheListingsIDs;

    // checking if user already exist 
    if(req.user){
      req.user.activeListings = [];
      let userActiveListingIDs = allTheListingsIDs.map((eachthing)=>{
        return eachthing.toString();

      })

      let leftListings = req.user.leftListings.map((eachthing)=>{
          return eachthing.toString();
      })

      // console.log(userActiveListing);
      // console.log(leftListings);
      // console.log("******",userActiveListing.length);
      userActiveListingIDs = userActiveListingIDs.filter((each)=>{
          return !leftListings.includes(each);
      })
    
      console.log("actual listing ids meow:", userActiveListingIDs.length);
      



      req.user.activeListings = userActiveListingIDs;

      req.user.save()
      .then(()=>{
        // res.redirect("/feed")
        // res.render('user-views/feed', {listings: allTheListings})
        // res.render('user-views/feed', {listings: allTheListings})

        console.log(userActiveListing);
        res.render('user-views/feed', {listings: userActiveListing})
      })
      .catch((err)=>{
        next(err)
      })
    }

    







    
// Un commment out right below
    //checking if user already exist 
    // if(req.user){
    //   let userActiveListing = allActiveListing;
    //   let leftListings = req.user.leftListings;

    //   leftListings.forEach((eachListListing)=>{
    //     userActiveListing.filter(eachListListing);
    //   })

    //   req.user.save()
    //   .then(()=>{
    //     // res.redirect("/feed")
    //     // res.render('user-views/feed', {listings: allTheListings})
    //     res.render('user-views/feed', {listings: allTheListings})
    //   })
    //   .catch((err)=>{
    //     next(err)
    //   })
    // }




    // // Change forEach into a for loop going in reverse to display newest listings
    // allTheListings.forEach((eachListing)=>{
    //   console.log('its a listing');

    //     if(eachListing.author._id.equals(req.user._id)){
    //         eachListing.owned = true;
    //     }

    // })
    // res.render('user-views/feed', {listings: allTheListings})
  })
  .catch((err)=>{
    next(err)
  })

})

router.post('/delete', (req, res, next)=>{
  Listing.find().populate('author')
  .then((allTheListings)=>{
    allTheListings.reverse();
    let currentListingID = allTheListings[0]._id;
    // console.log(currentListing.title);
    console.log(req.user.username);
    console.log(req.user.leftListings);

    req.user.leftListings.push(currentListingID);
    req.user.save()
    .then(()=>{
      res.redirect("/feed")
    })

    console.log(req.user.leftListings);


  })
  .catch((err)=>{
    next(err)
  })
})

router.post('/like', (req, res, next)=>{
  res.redirect("/feed")
})









module.exports = router;




