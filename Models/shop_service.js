var mongoose = require('mongoose')
const shop = require('./shop')
var moment = require("moment-timezone");
var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
var Schema = mongoose.Schema
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const ShopServiceSchema = new Schema({
    _id:mongoose.Schema.Types.ObjectId,
    name:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    details:{
        type: String,
        required: true
    },
    personalization:{
        type: String,
        required: false
    },
    category_id: mongoose.Schema.Types.ObjectId,
    subcategory_id: mongoose.Schema.Types.ObjectId,
    hashtags:{
        type: String,
        required: false
    },
    image:{
        type: Array,
        required: false,
        default: null
    },
    shop_id: mongoose.Schema.Types.ObjectId,
    status:{
        type: Boolean,
        default: true
    },
    chataddstatus:{
        type: Boolean,
        default: false
    },
    created_on: {
        type: Date,
        default: dateKolkata,
    }
})

ShopServiceSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("shop_services", ShopServiceSchema);