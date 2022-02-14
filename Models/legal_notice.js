var mongoose = require('mongoose');
var moment = require('moment-timezone');

var Schema = mongoose.Schema;

var dateKolkata = moment.tz(new Date(), "Asia/Kolkata");

const LEGAL_NOTICE_SCHEMA = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    date: {
        type: Date,
        default: dateKolkata
    },
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
    report_details: {
        type: String,
        required: true
    },
    file: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model("legal_notice", LEGAL_NOTICE_SCHEMA);