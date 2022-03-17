const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    user_id:mongoose.Schema.Types.ObjectId,
    prod_id:mongoose.Schema.Types.ObjectId,
    order_id:{
        type:Number
    },
    productname:{
        type:String,
        required:true
    },
    qty:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    discount_percent: {
        type: Number,
        default: 0
    },
    coupon: String,
    rating: Number,
    image:{
        type:Array,
        required:true
    },
    status:{
        type:Boolean,
        default:true
    },
    buy_date: Date
})

module.exports = mongoose.model('Cart',CartSchema);
