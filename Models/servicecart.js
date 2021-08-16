const mongoose = require('mongoose');

const ServiceCartSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    user_id:mongoose.Schema.Types.ObjectId,
    serv_id:mongoose.Schema.Types.ObjectId,
    order_id:{
        type:Number
    },
    servicename:{
        type:String,
        required:true
    },
    
    price:{
        type:Number,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    }
})

module.exports = mongoose.model('ServiceCart',ServiceCartSchema);
