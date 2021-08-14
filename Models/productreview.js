var mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    _id:mongoose.Schema.Types.ObjectId,
    product_id:mongoose.Schema.Types.ObjectId,
    user_id:mongoose.Schema.Types.ObjectId,
    rating:{
        type:Number
    }, 
    comment:{
        type:String,
    },
    order_id:{
        type:Number
    }

})

module.exports = mongoose.model("Review",ReviewSchema)