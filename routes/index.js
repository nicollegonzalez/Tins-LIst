const express = require('express');
const router  = express.Router();

/* GET home page */
router.get('/', (req, res, next) => {
  res.render('index');
});


router.get('/hey',(req, res, next)=>{
  if(!req.user){
    // this is how you can manually add something to req.flash
    req.flash('error', "you must be logged in to view the top secret hey page")
    res.redirect('/login')
  }


  res.render('hey')
})



module.exports = router;
