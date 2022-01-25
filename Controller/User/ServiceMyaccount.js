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
                    user_id: mongoose.Types.ObjectId(req.params.user_id),
                   
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
                $lookup: {
                    from: "service_refunds",
                    localField: "order_id",
                    foreignField: "order_id",
                    as: "servicerefund_data"
                }
            },
            // {
            //     $unwind: "$servicerefund_data"
            // },
            {
                $sort:{
                  _id: -1
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