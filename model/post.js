const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2')
const Schema = mongoose.Schema;

const posts = new Schema({
    bgImg:{
        type:String
    },
    text:{
        require:true,
        type:String
    },
    author:{
        type:String
    }
    ,date:{
        type:String
    },
    title:{
        type:String,
        require:true
    },
    authorId:{
        type:String
    }
    ,date:{
        type:String,
        require: true
    }
    ,time:{
        type:String,
        require:true
    }
})
posts.plugin(mongoosePaginate)
module.exports = mongoose.model('post',posts);