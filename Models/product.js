var mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
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

module.export = mongoose.model('Product',ProductSchema)