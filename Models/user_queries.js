var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const QUERY = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user_type: Object,
    user_category: String,
    email: String,
    question: String,
    additional_details: {
        type: String,
        default: ""
    },
    reply: String,
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