var mongoose = require('mongoose');
var moment = require("moment-timezone");
var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");

const FaqsubcatSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    qstn:{
        type:String,
        required:true,
        unique:true
    }, //
    ans:{
        type:String,
        required:true,
        unique:true
    }, //
    category_id: mongoose.Schema.Types.ObjectId,
    subcategory_id: mongoose.Schema.Types.ObjectId,
    status:{
        type:Boolean,
        default:true
    },
    created_on: {
        type: Date,
        default: dateKolkata,
    },

})

module.exports = mongoose.model("Faq",FaqsubcatSchema)