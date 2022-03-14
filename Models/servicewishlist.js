const mongoose = require('mongoose');

const ServicewishSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    user_id:mongoose.Schema.Types.ObjectId,
    serv_id:mongoose.Schema.Types.ObjectId,
    seller_id:mongoose.Schema.Types.ObjectId,
    servicename:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    image:{
        type:Array,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    }
})

module.exports = mongoose.model('Servicewish',ServicewishSchema);