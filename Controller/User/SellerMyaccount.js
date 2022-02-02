var mongoose = require('mongoose')
var moment = require("moment")

var ServiceCheckout = require('../../Models/servicecheckout')
var ServiceCommission = require('../../Models/servicecommission')
var Withdraw = require('../../Models/withdraw')

const viewAll = async (req, res) => {
    return ServiceCheckout.aggregate(
        [
            {
                $match: {

                    seller_id: mongoose.Types.ObjectId(req.params.seller_id),
                },
            },
            {
                $lookup: {
                    from: "servicecarts",
                    localField: "order_id",
                    foreignField: "order_id",
                    as: "servicecart_data"
                }
            },
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

const reportViewAll = async (req, res) => {
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
                $lookup: {
                    from: "servicecarts",
                    localField: "order_id",
                    foreignField: "order_id",
                    as: "servicecart_data"
                }
            },
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

const viewSingleOrder = async (req, res) => {
    return ServiceCheckout.aggregate(
        [
            {
                $match: {

                    _id: mongoose.Types.ObjectId(req.params.id),
                },
            },
            {
                $lookup: {
                    from: "servicecarts",
                    localField: "order_id",
                    foreignField: "order_id",
                    as: "servicecart_data"
                }
            },
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

var getClaimableCommissions = async (req, res) => {
    var id = req.params.id;

    let claimableCommissions = await ServiceCommission.find(
        {
            seller_id: mongoose.Types.ObjectId(id),
            status: true
        }
    ).exec();

    if (claimableCommissions.length > 0) {
        return res.status(200).json({
            status: true,
            message: "Data successfully get.",
            data: claimableCommissions
        });
    }
    else {
        return res.status(200).json({
            status: true,
            message: "No claimable commissions currently.",
            data: []
        });
    }
}

var claimCommission = async (req,res) => {
    var id = req.params.id;

    return ServiceCommission.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(id) }, 
        { $set: { sellerapply: true } }, 
        { new: true }
    )
        .then(docs => {
            let obj = {
                _id: mongoose.Types.ObjectId(),
                order_id: mongoose.Types.ObjectId(docs.order_id),
                seller_id: mongoose.Types.ObjectId(docs.seller_id),
                commision_type: docs.commision_type,
                commision_value: docs.commision_value,
                price: docs.price,
                seller_commission: docs.seller_commission,
                image: docs.image,
                txnid: docs.txnid
            }
            if (docs.image != null || docs.image != "" || typeof docs.image != "undefined") {
                obj.image = docs.image;
            }
            if (docs.txnid != null || docs.txnid != "" || typeof docs.txnid != "undefined") {
                obj.txnid = docs.txnid;
            }

            const NEW_WITHDRAW = new Withdraw(obj);
            NEW_WITHDRAW.save();
            
            res.status(200).json({
                status: true,
                message: "Data successfully updated.",
                data: docs
            });
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: "Invalid id. Server error.",
                error: err
            });
        });
}

module.exports = {
    viewAll,
    reportViewAll,
    viewSingleOrder,
    getClaimableCommissions,
    claimCommission
}