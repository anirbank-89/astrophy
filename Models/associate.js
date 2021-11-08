var mongoose = require('mongoose');
var moment = require("moment-timezone");
var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");

const AssoSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    heading:{
        type:String,
        required:true,
    },
    content1:{
        type:String,
        required:true,
    }, 
    image:{
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

module.exports = mongoose.model("Associate",AssoSchema)