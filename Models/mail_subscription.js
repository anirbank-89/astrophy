var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const MAIL_SUBSCR_SCHEMA = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model("mail_subscription", MAIL_SUBSCR_SCHEMA);