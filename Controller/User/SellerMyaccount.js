var mongoose = require('mongoose')
var ServiceCheckout = require('../../Models/servicecheckout')
var User = require('../../Models/user')
var ServiceCart = require('../../Models/servicecart')
const { Validator } = require('node-input-validator')

const viewAll = async (req,res)=>{
    return ServiceCheckout.aggregate(
        [
            {
                $match: {
                    
                    seller_id: mongoose.Types.ObjectId(req.params.seller_id),
                },
            },
            {
                $lookup:{
                    from:"servicecarts",
                    localField:"order_id",
                    foreignField:"order_id",
                    as:"servicecart_data"
                }
            },
            {
                $project:{
                    _v:0
                }
            }
        ]
    )
    .then((docs)=>{
        res.status(200).json({
            status: true,
            message: "Order History get successfully",
            data: docs
        })
    })
    .catch((err)=>{
        res.status(500).json({
            status: false,
            message: "Server error. Please try again.",
            error: err
        })
    })
}

module.exports = {
    viewAll
    
}