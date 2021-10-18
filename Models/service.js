var mongoose = require('mongoose');
var moment = require("moment-timezone");
var dateKolkata = moment.tz(Date.now(), "Asia/Kolkata");
var Schema = mongoose.Schema;

const ServiceSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true,
    },
    status:{
        type: Boolean,
        default: true,
        required: true
    },
    image:{
        type: String,
        required: true
    },
    created_on: {
        type: Date,
        default: dateKolkata,
    },
});

module.exports = mongoose.model("Service", ServiceSchema);