var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const LEGAL_NOTICE_SCHEMA = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user_id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: Number,
    url: String,
    report_against: {
        type: String,
        required: true
    },
    report_detail: {
        type: String,
        required: true
    },
    attachment: String,
    resolution_status: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("legal_notice", LEGAL_NOTICE_SCHEMA);