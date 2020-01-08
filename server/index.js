require('dotenv').config()
const express = require('express')
const app = express()
const routes = require('../routes/routes')
const session = require('express-session')
const mong = require('mongoose')

/*IK i shouldn't do this but it's just a demo DB*/
const key = "mongodb+srv://xoxo:xoxo6521@cluster0-anqbr.mongodb.net/test?retryWrites=true&w=majority"

//connecting to Mongodb
mong.connect(key,{useNewUrlParser: true,useUnifiedTopology: true} )
.then(()=>console.log('Connected to db'))
.catch(e => console.log(e))

//View Engine EJS
app.set('view engine','ejs')


//Session
app.use(session({secret:'cutepuppies',resave:true,saveUninitialized:false}))

//Views Folder
app.set('views','../views')

//Bodyparser
app.use(express.urlencoded({extended:false}))

//Routes
app.use(routes)

app.listen(process.env.PORT)
