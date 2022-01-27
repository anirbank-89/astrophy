var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const CURRENCY_SCHEMA = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    abbreviation: {
        type: String,
        required: true,
        unique: true
    },
    symbol: {
        type: String,
        required: true
    },
    subunit: {
        type: String,
        required: true
    },
    detailed_info: String,
    status: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model("currency", CURRENCY_SCHEMA);