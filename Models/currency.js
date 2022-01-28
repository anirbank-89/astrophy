var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const CURRENCY_SCHEMA = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
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
    symbol: String,
    subunit: String,
    tax_rate: {         // tax rate currency locale wise 
        type: Number,
        required: true
    },
    detailed_info: String,
    status: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model("currency", CURRENCY_SCHEMA);