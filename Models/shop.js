const mongoose = require('mongoose');
const Schema = mongoose.Schema

const ShopSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userid:{
        type: mongoose.Schema.Types.ObjectId,
        unique: true
    },
    name:{
        type: String,
        required: true
    },
    title:{
        type:String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    banner_img: String,
    shop_img: String,
    tags: String,
    personalization: String,
    pageViews: {
        type: Number,
        default: 0
    },
    start:{
        type: Date,
        default: Date.now
    },
    end:{
        type: Date,
        default: null
    },
    status:{
        type: Boolean,
        default: true
    }
});

module.exports = mongoose.model("Shop", ShopSchema);