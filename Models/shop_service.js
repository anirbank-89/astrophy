var mongoose = require('mongoose')
const shop = require('./shop')
var moment = require("moment-timezone");
var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
var Schema = mongoose.Schema
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const ShopServiceSchema = new Schema({
    _id:mongoose.Schema.Types.ObjectId,
    shop_id: mongoose.Schema.Types.ObjectId,
    seller_id: mongoose.Schema.Types.ObjectId,
    category_id: mongoose.Schema.Types.ObjectId,
    subcategory_id: mongoose.Schema.Types.ObjectId,
    name:{
        type: String,
        required: true
    },
    details:{
        type: String,
        required: true
    },
    // category: {
    //     cat_id: {
    //         type: mongoose.Schema.Types.ObjectId,
    //         required: true
    //     },
    //     cat_name: {
    //         type: String,
    //         required: true
    //     }
    // },
    cat_name: String, 
    subcat_name: String,
    personalization: String,
    hashtags: String,
    currency: {
        type: String,
        required: true
    },
    // tax: String,
    price:{
        type: Number,
        required: true
    },
    image:{
        type: Array,
        default: null
    },
    pageViews: {
        type: Number,
        default: 0
    },
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