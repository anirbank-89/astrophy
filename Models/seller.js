var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const SELLER = new Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    seller_id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    govt_id_name: {
        type: String,
        required: true,
    },
    govt_id: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    seller_status: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model("seller", SELLER);