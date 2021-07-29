const mongoose = require('mongoose');
const Schema = mongoose.Schema

const ShopSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    address:{
        type: String,
        required: false
    },
    phone:{
        type: Number,
        required: true,
        unique: false
    },
    email:{
        type: String,
        required: true,
        unique: false
    },
    userid:{
        type: mongoose.Schema.Types.ObjectId,
        unique: true
    },
    status:{
        type: Boolean,
        required: false,
        default: true
    },
    start:{
        type: Date,
        required: false,
        default: Date.now
    },
    end:{
        type: Date,
        required: false,
        default: null
    }
});

module.exports = mongoose.model("Shop", ShopSchema);