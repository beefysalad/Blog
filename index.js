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
const Post = require('./model/post')
const { get } = require('express/lib/response')
const mongoosePaginate = require('mongoose-paginate-v2')
const moment = require('moment')

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
mongoose.connect(process.env.MONGO_URL, {
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
app.get('/',isLoggedOut,paginatedResults(Post),getCurrentPage(),async (req,res)=>{
    const data = res.paginatedResults
    const pageData = await Post.find({})
    let currentPage = res.getCurrentPage
    let rem

    
    if(pageData%4!=0){
        rem=1
    }else{
        rem =0
    }
    const numpage = (Math.floor(pageData.length / 4)) + rem
    res.render('main',{data,numpage,currentPage})
})
app.get('/user-dashboard',isLoggedIn,paginatedResults(Post),getCurrentPage(),async (req,res)=>{
    const user = req.user
    const dataObject = res.paginatedResults
    const data = dataObject.results
    
    const pageData = await Post.find({})
    let currentPage = res.getCurrentPage
    let rem
    if(pageData.length%4!=0){
        rem=1
    }else{
        rem =0
    }
    // const options = {
    //     page: currentPage,
    //     limit: 4,
    //     sort:'desc'

    // }
    
    const numpage = (Math.floor(pageData.length / 4)) + rem
    // Post.paginate({},options,async(err,results)=>{
    //     if(err) return err
    //     console.log(results.totalPages)
    //     console.log("WITHOUT REVERSE")
    //     console.log(results.docs.reverse())
    //     const doc = results.docs.reverse()
    //     console.log('with reverse')
    //     console.log(doc)
    //     console.log(results.hasNextPage)
    //     console.log(results.hasPrevPage)
    //     console.log(`the next page is : ${results.nextPage}`)
    //     console.log(`the previous page is : ${results.prevPage}`)
    //     console.log(results.page)
    //     console.log(`this is the total pages: ${results.totalPages}`)
    //     shit = await results.docs
        
    // }).then(()=>{
       
    // })
    res.render('dashboard',{user,numpage,currentPage,data,dataObject})
 
   
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

app.get('/user-profile',isLoggedIn,(req,res)=>{
    const user = req.user
    res.render('profile',{user})
})
app.post('/new-blog',upload.single('img'),async(req,res)=>{
    const user =req.user
    let imgLink
    // console.log(user)
    if(req.file){
        imgLink = req.file.path
    }else if(!req.file){
        imgLink = 'https://res.cloudinary.com/dhqqwdevm/image/upload/v1648801260/DEV/cjb470crbldpvu5wz9cv.jpg'
    }
    const date = new Date()
    const newPost = new Post({
        title: req.body.title,
        bgImg: imgLink,
        text: req.body.text,
        author: user.username,
        authorId: user._id,
        date: moment(date).format('MM/DD/YYYY'),
        time: moment(date).format('LT')
    })
    await newPost.save()
    res.redirect('/user-dashboard')
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

app.get('/new-blog',isLoggedIn,(req,res)=>{
    const user = req.user
    res.render('newblog',{user})

})

app.get('/logout',(req,res)=>{
    req.logOut()
    res.redirect('/user-login')
})
app.listen(port,()=>{
    console.log(`Listening to port ${port}`)
})
app.get('/test',paginatedResults(Post),(req,res)=>{
    const data = res.paginatedResults
    console.log(data)
    res.render('test',{data})
})
//APIS

function paginatedResults(model) {
    return async (req, res, next) => {
        let page
        let limit
      if(!req.query.page){
        page = 1
        limit = 4
      }else{
        page = parseInt(req.query.page)
        limit = 4
      }
      const startIndex = (page - 1) * limit
      const endIndex = page * limit
  
      const results = {}
  
      if (endIndex < await model.countDocuments().exec()) {
        results.next = {
          page: page + 1,
          limit: limit
        }
      }
      
      if (startIndex > 0) {
        results.previous = {
          page: page - 1,
          limit: limit
        }
      }
      try {
        results.results = await model.find().limit(limit).skip(startIndex).exec()
        res.paginatedResults = results
        next()
      } catch (e) {
        res.status(500).json({ message: e.message })
      }
    }
  }
  function getCurrentPage(){
    return async (req,res,next)=>{

        let currentPage
        if(!req.query.page){
            currentPage = 1
        }else{
            currentPage = parseInt(req.query.page)
        }
        res.getCurrentPage = currentPage
        next()
    }
    
}