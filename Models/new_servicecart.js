var mongoose = require('mongoose');
var moment = require('moment-timezone');

var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");

const SERVICE_CART_SCHEMA = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    user_id:mongoose.Schema.Types.ObjectId,
    serv_id:mongoose.Schema.Types.ObjectId,
    seller_id:mongoose.Schema.Types.ObjectId,
    order_id: Number,
    rating: Number,
    servicename:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    currency: String,
    discount_percent: Number,
    tip: Number,
    image:{
        type:Array,
        required:true
    },
    acceptstatus: {
        type: String,
        default: "pending"
    },
    cancelstatus: {
        type: String,
        default: ""
    },
    status:{
        type:Boolean,
        default:true
    },
    refund_claim: {       // whether buyer can claim refund. Duration 3 days of seller accept
        type: Boolean,
        default: true
    },
    refund_request: {     // whether buyer has requested refund (within 3 ays of seller accept)
        type: String,
        default: ""
    },
    booking_date: {
        type: Date,
        default: dateKolkata
    }
});

module.exports = mongoose.model("new_servicecart", SERVICE_CART_SCHEMA);