var mongoose = require('mongoose');
var moment = require('moment-timezone');

var Schema = mongoose.Schema;

var dateKolkata = moment.tz(new Date(), "Asia/Kolkata");

const USER_PROBLEM_SCHEMA = new Schema({
    userid: mongoose.Schema.Types.ObjectId,
    date: {
        type: Date,
        default: dateKolkata
    },
    desc: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model("userproblem", USER_PROBLEM_SCHEMA);