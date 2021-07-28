var mongoose = require('mongoose');
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
    }
});

module.exports = mongoose.model("Service", ServiceSchema);