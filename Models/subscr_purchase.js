var mongoose = require('mongoose');
var moment = require('moment-timezone');
var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata")
var Schema = mongoose.Schema;

const UserSubsriptionSchema = new Schema({
    _id:Schema.Types.ObjectId,
    userid:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    subscr_id:{
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    seller_comission:{
        type: Number,
        required: true,
    },
    price:{
        type: Number,
        required: true
    },
    subscribed_on:{
        type: Date,
        default: dateKolkata
    }
});

module.exports = mongoose.model("UserSubscription", UserSubsriptionSchema);