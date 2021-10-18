var mongoose = require('mongoose')
var ServiceCheckout = require('../../Models/servicecheckout')
var User = require('../../Models/user')
var ServiceCart = require('../../Models/servicecart')
const { Validator } = require('node-input-validator')
var moment = require("moment");

const viewAll = async (req,res)=>{
    return ServiceCheckout.aggregate(
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
                    from:"servicecarts",//
                    localField:"order_id",//
                    foreignField:"order_id",
                    as:"servicecart_data"//
                }
            },
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
            message: "Service History get successfully",
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

const reportViewAll = async (req,res)=>{
    return ServiceCheckout.aggregate(
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
                    from:"servicecarts",
                    localField:"order_id",
                    foreignField:"order_id",
                    as:"servicecart_data"
                }
            },
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
                    from:"users",//
                    localField:"seller_id",//
                    foreignField:"_id",
                    as:"seller_data"//
                }
            },
            { $unwind : "$seller_data" },
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
    reportViewAll
}