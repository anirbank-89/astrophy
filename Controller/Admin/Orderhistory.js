var mongoose = require('mongoose')
// const { Validator } = require('node-input-validator')
var moment = require("moment")

var Checkout = require('../../Models/checkout')
// var Coupon = require('../../Models/coupon')
// var User = require('../../Models/user')
// var Cart = require('../../Models/cart')






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
            // {
            //     $unwind: {
            //         path: "$cart_data",
            //         preserveNullAndEmptyArrays: true
            //     }
            // },
            // {
            //     $lookup: {
            //         from: "product_refunds",
            //         localField: "order_id",
            //         foreignField: "order_id",
            //         as: "cart_data.refund_data"
            //     }
            // },
            { $sort: { _id: -1 } },
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

const productViewAllrepo = async (req,res)=>{
    return Checkout.aggregate(
        [
            (req.body.datefrom != "" && typeof req.body.datefrom != "undefined") &&
            (req.body.dateto != "" && typeof req.body.dateto != "undefined")
            ? {
                $match: {
                    "booking_date": {
                        "$gte": new Date(req.body.datefrom),
                        "$lte": moment.utc(req.body.dateto).endOf('day').toDate()
                    }
                },
              }
            : { $project: { __v: 0 } },
            {
                $lookup:{
                    from:"users",//
                    localField:"user_id",//
                    foreignField:"_id",
                    as:"user_data"//
                }
            },
            { $unwind : "$user_data" },
            {
                $lookup:{
                    from:"carts",//
                    localField:"order_id",//
                    foreignField:"order_id",
                    as:"cart_data"//
                }
            },
            // {
            //     $unwind: {
            //         path: "$cart_data",
            //         preserveNullAndEmptyArrays: true
            //     }
            // },
            // {
            //     $lookup: {
            //         from: "product_refunds",
            //         localField: "order_id",
            //         foreignField: "order_id",
            //         as: "cart_data.refund_data"
            //     }
            // },
            { $sort: { _id: -1 } },
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
    viewAll,
    productViewAllrepo
}