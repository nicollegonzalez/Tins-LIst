const express = require('express');
const router  = express.Router();

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});


// router.get('/profile',(req, res, next)=>{
//   if(!req.user){
//     // this is how you can manually add something to req.flash
//     req.flash('error', "you must be logged in to view the top secret profile page")
//     res.redirect('/login')
//   }
//   else(
//     res.render('user-views/profile')
//   )  
// })



module.exports = router;
