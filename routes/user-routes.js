const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const User    = require('../models/User');
const Listing    = require('../models/Listing');
const passport = require('passport');
const LocalStrategy = require("passport-local").Strategy;



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
        email: email
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

router.post('/logout', (req, res, next)=>{
  req.logout();
  res.redirect("/login");
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
    req.flash('error', "you must be logged in to view the top secret profile page")
    res.redirect('/login')
  }
  else(
    // res.render('user-views/profile')
    Listing.find().populate('author')
    .then((allTheListings)=>{
      console.log("******", allTheListings);

      allTheListings.forEach((eachListing)=>{
        console.log('its a listing')
  
          if(eachListing.author._id.equals(req.user._id)){
              eachListing.owned = true;
          }
  
      })

      res.render('user-views/profile', {listings: allTheListings})
    })
    .catch((err)=>{
      next(err);
    })
  )  
})






module.exports = router;




