var mongoose = require('mongoose')
var moment = require("moment-timezone");
var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
var Schema = mongoose.Schema

var SubCategorySchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name:{
        type:String,
        required:true,
        unique:true
    },
    description:{
        type: String,
        required: true
    },
    serviceid: mongoose.Schema.Types.ObjectId,
    categoryid: mongoose.Schema.Types.ObjectId,//
    status:{
        type:Boolean,
        default:true
    },
    created_on: {
        type: Date,
        default: dateKolkata,
    }
})

module.exports = mongoose.model('service_subcategory', SubCategorySchema);