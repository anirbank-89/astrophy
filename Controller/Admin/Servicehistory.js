var mongoose = require('mongoose')
var ServiceCheckout = require('../../Models/servicecheckout')
var User = require('../../Models/user')
var ServiceCart = require('../../Models/servicecart')
const { Validator } = require('node-input-validator')
var moment = require("moment");

const viewAll = async (req, res) => {
    return ServiceCheckout.aggregate(
        [
            {
                $lookup: {
                    from: "users",//
                    localField: "user_id",//
                    foreignField: "_id",
                    as: "user_data"//
                }
            },
            {
                $unwind: {
                    path: "$user_data",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "servicecarts",//
                    let: { order_id: "$order_id"},//
                    pipeline:[
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$order_id", "$$order_id"] }
                                    ]
                                }
                            }
                        }    
                    ],//
                    as: "servicecart_data"//
                }
            },
            {
                $unwind: {
                    path: "$servicecart_data",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "users",
                    let: { seller_id: "$servicecart_data.seller_id" }, 
                    pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$_id", "$$seller_id"] }] } } }], 
                    as: "servicecart_data.seller_data"
                }
            },
            {
                $unwind: {
                    path: "$servicecart_data.seller_data",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "shop_services",
                    let: { seller_id: "$seller_data._id" }, 
                    pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$seller_id", "$$seller_id"] }] } } }], 
                    as: "servicecart_data.seller_data.service_data"
                }
            },
            {
                $lookup: {
                    from: "service_refunds",
                    let: { seller_id: "$servicecart_data.seller_id" }, 
                    pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$seller_id", "$$seller_id"] }] } } }], 
                    as: "servicecart_data.service_refund"
                }
            },
            { $sort: { _id: -1 } },
            {
                $project: {
                    _v: 0
                }
            }
        ]
        // {
        //     allowDiskUse: true,
        //     cursor: { batchSize: 1000 }
        // }
    )
        .then((docs) => {
            res.status(200).json({
                status: true,
                message: "Service History get successfully",
                data: docs
            })
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({
                status: false,
                message: "Server error. Please try again.",
                error: err.message
            })
        })
}

const reportViewAll = async (req, res) => {
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
                $lookup: {
                    from: "servicecarts",
                    localField: "order_id",
                    foreignField: "order_id",
                    as: "servicecart_data"
                }
            },
            {
                $unwind: {
                    path: "$servicecart_data",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "service_refunds",
                    let: { seller_id: "$servicecart_data.seller_id" }, 
                    pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$seller_id", "$$seller_id"] }] } } }], 
                    as: "servicecart_data.service_refund"
                }
            },
            {
                $lookup: {
                    from: "users",//
                    localField: "user_id",//
                    foreignField: "_id",
                    as: "user_data"//
                }
            },
            { $unwind: "$user_data" },
            {
                $lookup: {
                    from: "users",//
                    localField: "seller_id",//
                    foreignField: "_id",
                    as: "seller_data"//
                }
            },
            { $unwind: "$seller_data" },
            { $sort: { _id: -1 } },
            {
                $project: {
                    _v: 0
                }
            }
        ]
    )
        .then((docs) => {
            res.status(200).json({
                status: true,
                message: "Order History get successfully",
                data: docs
            })
        })
        .catch((err) => {
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