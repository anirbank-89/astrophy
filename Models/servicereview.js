var mongoose = require('mongoose');
var moment = require("moment-timezone");
var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");

const ServiceReviewSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    service_id:mongoose.Schema.Types.ObjectId,
    user_id:mongoose.Schema.Types.ObjectId,
    seller_id:mongoose.Schema.Types.ObjectId,
    rating:{
        type:Number
    }, 
    comment:{
        type:String,
    },
    order_id:{
        type:Number
    },
    rev_date:{
        type: Date,
		default: dateKolkata,
		required: false
    }

})

module.exports = mongoose.model("ServiceReview",ServiceReviewSchema)