var mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    catID:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    image:{
        type:String,
        required:false;
    },
    status: {
        type: Boolean,
        required: true,
        default: true
    },
    adminStatus: {
    type: Boolean,
    required: true,
    default: true
    },


    
})

module.exports = mongoose.model('Product',ProductSchema)