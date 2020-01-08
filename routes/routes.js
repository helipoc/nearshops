const express = require('express')
const route = express.Router()
const bcrypt = require('bcryptjs')
const User = require('../models/User')
const shop = require('../models/Shop')


route.get('/',(req,res)=>{
    if(!req.session.user)res.render('login',{msgerr:"Please Login To Continue"})//checking if the user is logged in
    else {res.render('home',{user:req.session.user})}
})

route.get('/register',(req,res)=>{
    if(req.session.user)res.redirect('/')//logged-in users shouldn't create accounts right ? 
    else{res.render("register.ejs")}
})

route.post('/register',(req,res)=>{
    if(req.session.user)res.status(401).send('you are already logged in dont do this :)')//checking if someone trynna do bad stuffs :)
    const {email , password , pass2} = req.body // extracting the request data
    let errors = [] // array of errors so we can display it to the user
    if(!password || !pass2 || !email)
    {
        errors.push({msg:"Please fill all fields"})
    }
    if(password!==pass2) //checking if the two passwords are identical 
    {
      errors.push({msg : "Passwords aren't identical !"})
    }
    if(password.length<6 || pass2.length<6) // pass length > 6
    {
        errors.push({msg:"Please use at least 6 characters in your password"})
    }
    if(errors.length>0){ // if there's an error we re-render the page and display the error check line 33 in register file
        res.render('register',{errors})
    }
    else {
        User.findOne({email:email})//checking if the email is already registered
        .then(u=> {
            if(u){
                errors.push({msg:"User Already Exists !"})
                res.render("register",{errors})// re-rendering the register page with already exists error
            }
            else{
                const user = new User({email,password});//creating the user
                bcrypt.genSalt(10,(err,salt)=>{//generating a salt to hash the password with
                    bcrypt.hash(user.password,salt,(err,hash)=>{
                        if(err) throw(err);
                        user.password=hash;//hashing the password with the generated salt 
                        user.save().then(u=>{res.render('login',{msg:"You are now registered please login !"})});//inserting user to database and displaying the login page
                    })
                })
         }
        })
    }
}) 
        

route.get('/login',(req,res)=>{
    if(req.session.user)res.redirect('/')//if user is already logged in there's no need to display the login page for him i guess
    res.render("login.ejs")
})
route.post('/login',(req,res)=>{//post login route

if(req.session.user)res.status(401).send('you are already logged in dont do this :)')//checking again idk ppl are crazy these days
else{
const {email,password} = req.body//getting email and password from post data
User.findOne({email:email})//searching for email in database
.then(u=>{
    if(!u){
        res.render('login',{msgerr:"User doesn't Exists"})//If email isn't found in the Database
    }
    else {
    bcrypt.compare(password,u.password,(err,ismatch)=>{//comparing the real user password hash and the given password hash
        if(err)throw err;
        if(ismatch)//Logged in ! 
        {
            req.session.user = u;//adding Object user to the Object session so we can know which user exactly is logged in
            res.render('home',{user:u})//user is logged in , now he can see the home page
        }
        else res.render('login',{msgerr:'Password Incorrect'})
    })
    }
})
}
})

//loginout route
route.get('/logout',(req,res)=>{
req.session.destroy();
res.redirect('/login')

})

//shops routes
route.get('/shops/all',(req,res)=>{
    if(!req.session.user)res.send('Please Login')//checking if the user is logged in 
    else{
    User.findOne({email:req.session.user.email})//getting current logged in user
    .then(u=>u.shops)//getting current user fav list
    .then(ids => shop.find().where('_id').nin(ids).exec((err, shops) => {res.send(JSON.stringify(shops))}))//sending shops that are not in the user favorite shops list
    }
})

//liking shop api
route.get('/shops/like/:id',(req,res)=>{
if(!req.session.user)res.send("You should login First !")
else {
const {id} = req.params//getting the shop id from request object
User.findOne({email:req.session.user.email})//getting the current loggedin user
.then(u=>{if(u.shops.indexOf(id)==-1){u.shops.push(id);u.save()}})//adding reference  _id of the shop to user favourite shops list
res.send("Added to favs!")
}
})

//favourite shops of the user api
route.get('/shops/fav',(req,res)=>{
if(!req.session.user)res.send('Please Login :)')//he should be logged in ofc
else{
User.findOne({email:req.session.user.email})//getting the current user
.then(u=>u.shops)//getting his favourite shops list
.then(ids => shop.find().where('_id').in(ids).exec((err, favShops) => {res.send(JSON.stringify(favShops))}))//getting each shop document  from shops collections where the shop _id is in user shops Array
}






    
})

route.get('/shops/del/:id',(req,res)=>{
if(!req.session.user)res.send('Please Login :)')
else{
User.findOne({email:req.session.user.email})
.then(u=>{u.shops.pull(req.params.id);u.save();})
res.send('ok')
}
})



module.exports = route