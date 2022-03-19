const express = require('express')
const app = express()
const path = require('path')
const port = process.env.PORT || 8080
const mongoose = require('mongoose')
const User = require('./model/user')
const bcrypt = require('bcrypt')
const flash = require('express-flash')
const session = require('express-session')
const passport = require('passport')
const localStrategy = require('passport-local')
const dotenv = require('dotenv')
const multer = require('multer')
const cloudinary = require('cloudinary').v2
const {CloudinaryStorage} = require('multer-storage-cloudinary')



console.clear()
app.use(session({
    secret:"topibakat",
    resave: false,
    saveUninitialized:true
}))
app.use(passport.initialize())
app.use(passport.session())
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/views'));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.urlencoded({extended:true}));
app.use(flash())

dotenv.config()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params:{
        folder:"DEV"
    }
})
const upload = multer({
    storage: storage,
   
})
mongoose.connect("mongodb+srv://beefysalad:topibakat@cluster0.bgpas.mongodb.net/BlogApp?retryWrites=true&w=majority", {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    
})
const db = mongoose.connection
db.on("error",console.error.bind(console,"connection error"))
db.once("open",()=>{
    console.log('Database connected')
})

passport.use('user',new localStrategy(async (username,password,done)=>{
    User.findOne({username:username},function(err,user){
        if(err) return done(err)
        if(!user) return done(null,false,{message:'Invalid username or password'})
        bcrypt.compare(password,user.password,function(err,res){
            if(err) return done(err)
            if(res===false) return done(null,false,{message:'Invalid username or password'})
            return done(null,user)
        })
    })
}))
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/user-login')
}
function isLoggedOut(req,res,next){
    if(!req.isAuthenticated()){
        return next()
    }
    res.redirect('/user-dashboard')
}
passport.serializeUser((user,done)=>{
    done(null,user.id)
})
passport.deserializeUser((id,done)=>{
    User.findById(id,(err,user)=>{
        if(user){
            done(null,user)
        }else{
            done(err)
        }
    })
})
app.get('/',isLoggedOut,(req,res)=>{
    res.render('main')
})
app.get('/user-login',isLoggedOut,(req,res)=>{
    res.render('login')
})
app.get('/user-registration',isLoggedOut,(req,res)=>{
    res.render('register')
})
app.post('/user-registration',(req,res)=>{
    User.findOne({username:req.body.username},(err,user)=>{
        if(user){
            req.flash('error','Username is already taken!')
            res.redirect('/user-registration')
        }
        else{
            bcrypt.genSalt(10,function(err,salt){
                if(err) return next(err)
                bcrypt.hash(req.body.password,salt,async(err,hash)=>{
                    if(err) return next(err)
                    const newUser = new User({
                        username:req.body.username,
                        password:hash,
                        imgUrl: 'https://res.cloudinary.com/dhqqwdevm/image/upload/v1631383900/DEV/defaultmale_xwnrss.jpg'
                    })
                    await newUser.save()
                    res.redirect('/user-login')
                })
            })
        }
    })
})
app.post('/user-login',passport.authenticate('user',{
    successRedirect:'/user-dashboard',
    failureRedirect:'/user-login',
    failureFlash:true
}))
app.get('/user-dashboard',isLoggedIn,(req,res)=>{
    const user = req.user
    res.render('dashboard',{user})
})
app.get('/user-profile',isLoggedIn,(req,res)=>{
    const user = req.user
    res.render('profile',{user})
})

app.post('/update-user-profile',upload.single('img'),async(req,res)=>{
    const user = req.user
    if(req.file){
       User.findByIdAndUpdate(user._id,{about: req.body.about,imgUrl:req.file.path}).then(data=>{
        
       })
    }else if(!req.file){
         User.findByIdAndUpdate(user._id,{about: req.body.about}).then(data=>{
           
       })
    }
    res.redirect('/user-profile')
})



app.get('/logout',(req,res)=>{
    req.logOut()
    res.redirect('/user-login')
})
app.listen(port,()=>{
    console.log(`Listening to port ${port}`)
})
