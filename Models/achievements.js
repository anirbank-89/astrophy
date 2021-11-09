var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const ACHIEVEMENT_SCHEMA = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("achievement", ACHIEVEMENT_SCHEMA);