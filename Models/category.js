var mongoose = require('mongoose');
var moment = require("moment-timezone");
var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");

const CategorySchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    name:{
        type:String,
        required:true,
        unique:true
    }, //
    content:{
        type:String,
        required:true,
    }, //
    status:{
        type:Boolean,
        default:true
    },
    created_on: {
        type: Date,
        default: dateKolkata,
    },

})

module.exports = mongoose.model("Category",CategorySchema)