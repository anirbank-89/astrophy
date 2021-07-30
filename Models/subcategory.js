var mongoose = require('mongoose')
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
    }
})

module.exports = mongoose.model('service_subcategory', SubCategorySchema);