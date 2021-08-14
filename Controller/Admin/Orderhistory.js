var mongoose = require('mongoose')
var Checkout = require('../../Models/checkout')
var Coupon = require('../../Models/coupon')
var User = require('../../Models/user')
var Cart = require('../../Models/cart')




const { Validator } = require('node-input-validator')


const viewAll = async (req,res)=>{
    return Checkout.aggregate(
        [
            {
                $lookup:{
                    from:"users",//
                    localField:"user_id",//
                    foreignField:"_id",
                    as:"user_data"//
                }
            },
            {
                $lookup:{
                    from:"carts",//
                    localField:"order_id",//
                    foreignField:"order_id",
                    as:"cart_data"//
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