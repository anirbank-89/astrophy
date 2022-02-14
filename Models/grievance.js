var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const COMPLAINT_SCHEMA = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    fullname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: String,
    url: String,
    report_against: {
        type: String,
        required: true
    },
    report_detail: {
        type: String,
        required: true
    },
    file: String,
    resolution_status: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("grievances", COMPLAINT_SCHEMA);