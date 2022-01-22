const mongoose = require('mongoose');
var moment = require("moment-timezone");
var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");

const ServiceCheckoutSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    user_id:mongoose.Schema.Types.ObjectId,
    seller_id:mongoose.Schema.Types.ObjectId,
    order_id:
    {
        type:Number,
    },
    booking_date:{
        type: Date,
		default: dateKolkata,
		required: false
    },
    subtotal:{
        type:Number,
        required:true
    },
    /*discount_percent:{
        type:Number,
        required:true
    },*/
    total:{
        type:Number,
        required:true
    },
    /*coupon_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:false
    },
    coupon:{
        type:String,
        required:false,
    },*/
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    address1:{
        type:String,
        required:true
    },
    address2:{
        type:String,
        required:false
    },
    country:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    zip:{
        type:Number,
        required:true
    },
    paymenttype:{
        type:String,
        required:true
    },
    cardname:{
        type:String,
        required:false
    },
    cardno:{
        type:Number,
        required:false
    },
    expdate:{
        type:String,
        required:false
    },
    cvv:{
        type:Number,
        required:false
    },
    tip:{
        type:Number,
        required:false
    },
    status:{
        type:String,
        default:true
    },
    acceptstatus:{
        type: String,
        default: 'pending'
    },
    completestatus: {
        type: Boolean,
        default: false
    },
    tokenid:{
        type:String,
        default:null
    }
})

module.exports = mongoose.model('ServiceCheckout',ServiceCheckoutSchema);
