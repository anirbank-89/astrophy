var mongoose = require('mongoose');
var moment = require("moment-timezone");
var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");

const PrivacySchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    content1:{
        type:String,
        required:true,
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

module.exports = mongoose.model("Privacy",PrivacySchema)