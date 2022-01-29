var mongoose = require('mongoose');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
var moment = require("moment-timezone");
var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");

const ProductSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    catID:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    name:{
        type: String,
        required: true,
        unique: true
    },
    description:{
        type: String,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    mrp:{
        type: Number,
        required: true
    },
    selling_price:{
        type: Number,
        required: true
    },
    tax: String,
    // total: Number,
    image: Array,
    status: {
        type: Boolean,
        default: true
    },
    adminStatus: {
        type: Boolean,
        default: true
    },
    delivery:{
        type: String,
        required: true
    },
    delivery_time:{
        type: String,
        required: true
    },
    created_on: {
        type: Date,
        default: dateKolkata,
    }


    
})

ProductSchema.plugin(aggregatePaginate);

module.exports = mongoose.model('Product',ProductSchema)