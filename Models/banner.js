var mongoose = require('mongoose');
var moment = require("moment-timezone");
var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");

const BannerSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,   
    image:{
        type:String
    },
    status:{
        type:Boolean,
        default:true,
    },
    created_on: {
        type: Date,
        default: dateKolkata,
    },

})

module.exports = mongoose.model("Banner",BannerSchema)