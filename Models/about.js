var mongoose = require('mongoose');
var moment = require("moment-timezone");
var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");

const AboutSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    content1:{
        type:String,
        required:true,
    }, 
    content2:{
        type:String,
        required:true,
    },
    image:{
        type:String,
    },
    created_on: {
        type: Date,
        default: dateKolkata,
    },

})

module.exports = mongoose.model("About",AboutSchema)