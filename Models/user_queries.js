var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const QUERY = new Schema({
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
    additional_details: {
        type: String,
        default: ""
    },
    receive_mail: {
        type: String,
        default: 'tesdata.stack@gmail.com'
    },
    resolution_status: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("user_query", QUERY);