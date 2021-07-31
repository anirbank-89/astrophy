const mongoose = require('mongoose');
const Schema = mongoose.Schema

const ShopSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    banner_img: {
        type: String,
        required: false
    },
    shop_img:{
        type: String,
        required: false
    },
    name:{
        type: String,
        required: true
    },
    title:{
        type:String,
        required: true
    },
    tags:{
        type: String,
        required: false
    },
    description:{
        type: String,
        required: true
    },
    personalization:{
        type: String,
        required: false
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