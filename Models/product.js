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
    mrp:{
        type:Number,
        required:true
    },
    selling_price:{
        type:Number,
        required:true
    },
    image:{
        type:String,
        required:false
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
    delivery:{
        type:String,
        required:true
    },


    
})

module.exports = mongoose.model('Product',ProductSchema)