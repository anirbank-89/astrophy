var mongoose = require('mongoose');
var moment = require("moment-timezone");
var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");

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
        type:String,
        required:false,
    },
    discount_type: {
        type: String,
        required: true,
      },
    discount_value: {
        type: Number,
        required: true
      }, 
    // applicable_date:{
    //     type:String,
    //     required:false,
    // },
    times:{
        type:Number,
        required:true,
    }, 
    status:{
        type:Boolean,
        default:true
    },
    created_on: {
        type: Date,
        default: dateKolkata,
    },

})

module.exports = mongoose.model("Coupon",CouponSchema)