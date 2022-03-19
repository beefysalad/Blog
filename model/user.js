const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const user = new Schema({
    username:{
        require:true,
        type:String
    },
    password:{
        require:true,
        type:String
    },
    imgUrl:{
        type:String
    }
    ,about:{
        type:String
    }
})

module.exports = mongoose.model('user',user);