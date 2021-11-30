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

const reportViewAll = async (req,res)=>{
    return ServiceCheckout.aggregate(
        [
            {
                $match: {
                    
                    seller_id: mongoose.Types.ObjectId(req.body.seller_id),
                },
            },
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

const viewSingleOrder = async (req,res)=>{
    return ServiceCheckout.aggregate(
        [
            {
                $match: {
                    
                    _id: mongoose.Types.ObjectId(req.params.id),
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
    viewAll,
    reportViewAll,
    viewSingleOrder
    
}