var mongoose = require('mongoose');


const ContactSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    email:{
        type:String,
        required:true,
    },
    status:{
        type:Boolean,
        default:true
    }

})

  module.exports = mongoose.model("Contact",ContactSchema)