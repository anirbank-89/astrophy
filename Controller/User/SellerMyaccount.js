var mongoose = require('mongoose')
var moment = require("moment")

// var ServiceCheckout = require('../../Models/servicecheckout')
// var ServiceCart = require('../../Models/servicecart')
var NewServiceCart = require('../../Models/new_servicecart')
var ServiceCommission = require('../../Models/servicecommission')
var Withdraw = require('../../Models/withdraw')
var ShopServices = require('../../Models/shop_service')
var ServiceRefund = require('../../Models/service_refund')

const viewAll = async (req, res) => {
    var id = req.params.seller_id;

    return NewServiceCart.aggregate([
        {
            $match: {
                seller_id: mongoose.Types.ObjectId(id)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user_data"
            }
        }
    ])
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
    var id = req.params.id;

    return NewServiceCart.aggregate(
        [
            {
                $match: {
                    _id: mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup: {
                    from: "shop_services",
                    localField: "serv_id",
                    foreignField: "_id",
                    as: "service_data"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_data"
                }
            },
            {
                $lookup: {
                    from: "service_refunds",
                    localField: "_id",
                    foreignField: "cart_id",
                    as: "refund_data"
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

// This is datewise seller booking history
const reportViewAll = async (req, res) => {
    return NewServiceCart.aggregate(
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
                        booking_date: {
                            $gte: moment.utc(req.body.datefrom).startOf('day').toDate(),
                            $lte: moment.utc(req.body.dateto).endOf('day').toDate()
                        }
                    },
                }
                : { $project: { __v: 0 } },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_data"
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

var buyHistFromUser = async (req, res) => {
    let boughtServices = await NewServiceCart.aggregate([
        {
            $match: {
                seller_id: mongoose.Types.ObjectId(req.body.self_id),
                user_id: mongoose.Types.ObjectId(req.body.buyer_id),
            }
        },
        {
            $lookup: {
                from: "shop_services",
                localField: "serv_id",
                foreignField: "_id",
                as: "service_data"
            }
        },
        {
            $unwind: "$service_data"
        },
        {
            $project: {
                __v: 0
            }
        }
    ]).exec();

    if (boughtServices.length > 0) {
        return res.status(200).json({
            status: true,
            message: "Data successfully get.",
            no_of_buys: boughtServices.length,
            purchase_data: boughtServices
        });
    }
    else {
        return res.status(200).json({
            status: true,
            message: "No previous buys from this seller.",
            no_of_buys: 0,
            purchase_data: []
        });
    }
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

var claimCommission = async (req, res) => {
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
                message: "Claim successfully. Amount will be credited to account after 15 days.",
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

var summaryStats = async (req, res) => {
    var id = req.params.id;

    let activeShopServices = await ShopServices.find(
        {
            seller_id: mongoose.Types.ObjectId(id),
            status: true
        }
    ).exec();
    var totalActiveServices = activeShopServices.length;

    let inactiveShopServices = await ShopServices.find(
        {
            seller_id: mongoose.Types.ObjectId(id),
            status: false
        }
    ).exec();
    var totalInactiveServices = inactiveShopServices.length;

    let shopServices = await ShopServices.find({ seller_id: mongoose.Types.ObjectId(id) }).exec();

    var totalViews = 0;

    shopServices.forEach(element => {
        if (element.pageViews == null || element.pageViews == "" || typeof element.pageViews == "undefined") {
            totalViews = totalViews;
        }
        else {
            totalViews += element.pageViews;
        }
    });

    let commissionsReceived = await ServiceCommission.find(
        {
            $expr:
            {
                $and: [
                    {
                        $eq:
                            ["$seller_id", mongoose.Types.ObjectId(id)]
                    },
                    {
                        $eq:
                            [{ $dateToString: { format: '%Y', date: "$created_on" } }, `${new Date().getFullYear()}`]
                    }
                ]
            }
        }
    ).exec();
    console.log(commissionsReceived);

    var serviceCommissions = 0;

    commissionsReceived.forEach(element => {
        serviceCommissions = parseInt(serviceCommissions) + parseInt(element.seller_commission);
    });
    console.log("Total commission ", serviceCommissions);

    let commissionAmtRef = await ServiceRefund.find(
        {
            $expr:
            {
                $and: [
                    { $eq: ["$seller_id", mongoose.Types.ObjectId(id)] },
                    { $eq: [{ $dateToString: { format: '%Y', date: "$request_date" } }, `${new Date().getFullYear()}`] },
                    { $eq: ["$request_status", "approved"] }
                ]
            }
        }
    ).exec();

    var refundedAmt = 0;

    if (commissionAmtRef.length > 0) {
        refundedAmt = refundedAmt;
    }
    else {
        commissionAmtRef.forEach(element => {
            refundedAmt = parseInt(refundedAmt) + parseInt(element.refund_amount);
        });
    }
    console.log("Total refunds ", refundedAmt);

    var currentYearRev = serviceCommissions - refundedAmt;

    return res.status(200).json({
        status: true,
        message: "Data successfully get.",
        total_active_services: totalActiveServices,
        total_inactive_Services: totalInactiveServices,
        total_views: totalViews,
        revenue_this_year: currentYearRev
    });
}

module.exports = {
    viewAll,
    viewSingleOrder,
    reportViewAll,
    buyHistFromUser,
    getClaimableCommissions,
    claimCommission,
    summaryStats
}