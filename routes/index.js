var express = require('express');
var router = express.Router();
var userModel = require('./users');
const passport = require('passport');
const localStrategy = require('passport-local')
var multer = require("multer");
var path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
   var dt = new Date();
   var fn = Math.floor(Math.random()*1000000)+dt.getTime() + path.extname(file.originalname);
    cb(null,  fn);
  }
})
router.get('/find/:username', isLoggedIn,function(req, res, next) {
  var regexp = new RegExp("^"+ req.params.username);
userModel.find({ username: regexp})
.then(function(user){
  res.json(user)
})
})

function fileFilter (req, file, cb) {

  if(file.mimetype==='image/png' || file.mimetype==='image/jpg' || file.mimetype==='image/webp' || file.mimetype==='image/jpeg' ){
    cb(null, true)
  }
 else{

  cb(new Error('I don\'t have a clue!'))
 }


}


const upload = multer({ storage: storage ,fileFilter  })
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/username/:username', function(req, res, next) {
  userModel.findOne({username:req.params.username})
  .then(function(foundUser){
  if (foundUser){
res.json({found:true})
  }else{
    res.json({found:false})
  }
  })
});

passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',);
});

router.get('/profile',isLoggedIn, function(req, res, next) {
var user = req.session.passport
userModel.findOne({username:req.session.passport.user})
.then(function(foundUser){
  res.render('profile', {user:foundUser})
})
});

router.get("/feed", function(req,res){
  userModel.find().then(function(allcard){
    res.render('feed',{allcard})
  })
});
router.post("/upload",isLoggedIn, upload.single('file'), function(req,res){
userModel.findOne({username:req.session.passport.user})
.then(function(loggedinuser){
  loggedinuser.profile= req.file.filename;
  loggedinuser.save()
  .then(function(){
   res.redirect("back")
  })

})
});

// router.get('/feed',isLoggedIn, function(req, res, next) {
//  userModel.find()
//  .then(function(users){
//   res.render("allusers",{users});
//  })
//   });
  

router.get('/like/:id',isLoggedIn, function(req, res, next) {
 userModel.findOne({_id:req.params.id})
 .then(function(user){
  var index = user.like.indexOf(req.session.passport.user);
  if(index===-1){
    user.like.push(req.session.passport.user);
  }
  else{
    user.like.splice(index,1)
  }
  user.save()
  .then(function(){
    res.redirect("back")
  });
 })

  });
  



router.post('/register', function(req, res, next) {
  var newUser = new userModel({
    username:req.body.username,
    email:req.body.email,
    number:req.body.number,
    profile:req.body.profile
  })


  

userModel.register(newUser , req.body.password)
.then(function()
{ 
  passport.authenticate("local")(req,res,function(){
    res.redirect("/profile")
  })
})
.catch(function(val){
  res.send(val)
})
});


router.post('/login', passport.authenticate('local',
{
successRedirect:'/profile',
failureRedirect:'/'
 
}),function(req,res,next){});



router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});


function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next ();
  }
  else {
    res.redirect("/");
  }
}


module.exports = router;
