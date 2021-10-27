const mongoose = require('mongoose');

const SellercomissionSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    order_id:mongoose.Schema.Types.ObjectId,
    seller_id:mongoose.Schema.Types.ObjectId,
    commision_type:{
        type:String,
        required:true
    },
    commision_value:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    seller_commission:{
        type:Number,
        required:true
    },    
    status:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model('Sellercomission',SellercomissionSchema);
