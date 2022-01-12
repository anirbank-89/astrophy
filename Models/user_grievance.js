var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const GRIEVANCE = new Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    user_type: {
        type: Object,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    grievance: {
        type: String,
        required: true
    },
    resolution_status: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("user_grievance", GRIEVANCE);