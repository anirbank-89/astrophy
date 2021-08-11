var mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    name:{
        type:String,
        required:true,
        unique:true
    }, 
    minprice:{
        type:Number,
        required:true,
    }, 
    percent:{
        type:Number,
        required:true,
    }, 
    expdate:{
        type:Date,
        required:true,
    }, 
    times:{
        type:Number,
        required:true,
    }, 
    status:{
        type:Boolean,
        default:true
    }

})

module.exports = mongoose.model("Coupon",CouponSchema)