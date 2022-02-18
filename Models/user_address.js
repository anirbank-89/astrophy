var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const ADDRESS_SCHEMA = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userid: mongoose.Schema.Types.ObjectId,
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    address1: {
        type: String,
        required: true
    },
    address2: String,
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    zip: {
        type: Number,
        required: true
    },
    billing: {
        type: Boolean,
        default: true
    },
    shipping: {
        type: Boolean,
        default: false
    },
    future_use: {
        type: Boolean,
        default: false
    },
    address_type: String,
});

module.exports = mongoose.model("useraddress", ADDRESS_SCHEMA);