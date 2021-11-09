var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const FEEDBACK_SCHEMA = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    feedback_detail: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("user_feedback", FEEDBACK_SCHEMA);