var mongoose = require('mongoose');
var moment = require("moment-timezone");
var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");

const FaqsubcatSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    name:{
        type:String,
        required:true,
        unique:true
    }, //
    category_id:
    {
        type:mongoose.Schema.Types.ObjectId,
        required:true
    } ,
    status:{
        type:Boolean,
        default:true
    },
    created_on: {
        type: Date,
        default: dateKolkata,
    },

})

module.exports = mongoose.model("Faqsubcat",FaqsubcatSchema)