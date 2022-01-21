var mongoose = require('mongoose');
var moment = require('moment-timezone');

var Schema = mongoose.Schema;

var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");

const PRODUCT_REFUND_SCHEMA = new Schema({
    user_id:mongoose.Schema.Types.ObjectId,
    order_id:
    {
        type:Number,
    },
    request_date:{
        type: Date,
		default: dateKolkata,
		required: false
    },
    refund_amount:{
        type:Number,
        required:true
    },
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
    tokenid:{
        type:String,
        default:null
    },
    request_status:{
        type: String,
        default:"new"
    },
    refund_status: {
        type: Boolean,
        default: false
    }
    // subtotal:{
    //     type:Number,
    //     required:true
    // },
    // coupon_type:{
    //     type:String,
    //     required:false
    // },
    // discount_percent:{
    //     type:Number,
    //     required:false
    // },
    // coupon_id:{
    //     type:mongoose.Schema.Types.ObjectId,
    //     required:false
    // },
    // coupon:{
    //     type:String,
    //     required:false,
    // }
});

module.exports = mongoose.model("product_refund", PRODUCT_REFUND_SCHEMA);