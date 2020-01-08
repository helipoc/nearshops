//Creating A Mongodb Model User And Exporting It 
const mong = require('mongoose');
const userSche = new mong.Schema({
    email: {
        type:String,
        required:true
    },
    password:{
        type:String,
        require:true
    },
    shops: [{ type: mong.Schema.Types.ObjectId, ref: 'shop' }]//Array of shops _id (favourite user shops)
});
const User = mong.model("User",userSche);

module.exports = User;
