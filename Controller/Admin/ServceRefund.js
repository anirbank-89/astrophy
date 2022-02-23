var mongoose = require('mongoose');

const SERVICE_REFUND = require('../../Models/service_refund');
const SERVICE_COMMISSION = require('../../Models/servicecommission');
const SUBSCRIBED_BY = require('../../Models/subscr_purchase');
const TOTAL_SERVICE_COMMISSION_REFUND = require('../../Models/total_servicecomission_refund');
const SERVICE_CART = require('../../Models/new_servicecart');

var getAllRefundRequests = async (req, res) => {
    var refundRequests = await SERVICE_REFUND.aggregate([
        {
            $match: {
                request_status: "new"
            }
        },
        {
            $lookup: {
                from: "new_servicecarts",
                localField: "order_id",
                foreignField: "order_id",
                as: "cart_items"
            }
        },
        {
            $unwind: "$cart_items"
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
            $lookup: {
                from: "sellers",
                localField: "seller_id",
                foreignField: "seller_id",
                as: "seller_details"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user_details"
            }
        }
    ]).exec();
    console.log("Request data ", refundRequests);

    if (refundRequests.length > 0) {
        return res.status(200).json({
            status: true,
            message: "Data successfully get.",
            data: refundRequests
        });
    }
    else {
        return res.status(200).json({
            status: true,
            message: "No active requests.",
            data: []
        });
    }
}

var approveRefund = async (req, res) => {
    var id = req.params.id;

    return SERVICE_REFUND.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: { request_status: "approved" } },
        { new: true }
    )
        .then(async (docs) => {
            console.log("Service refund", docs);

            SERVICE_COMMISSION.findOneAndUpdate(
                { cart_id: docs.cart_id },
                { $set: { refund: true } }
            ).exec();
            
            // Incrementing the total service commission refunded amount
            let subDataf = await SUBSCRIBED_BY.findOne(
                {
                    userid: docs.seller_id,
                    status: true
                }
            ).exec();

            let sellerCom = 0;

            let comType = subDataf.comission_type

            let comValue = subDataf.seller_comission



            if (comType == "Flat comission") {
                sellerCom = comValue;
            }
            else {
                sellerCom = (docs.refund_amount * comValue) / 100;
            }

            let total_refund_commission = await TOTAL_SERVICE_COMMISSION_REFUND.findOne({ seller_id: docs.seller_id }).exec();

            if (total_refund_commission == null || total_refund_commission == "") {
                let saveData = {
                    seller_id: docs.seller_id,
                    total_refunded: sellerCom
                }
                const NEW_REFUNDED_COMMISSION = new TOTAL_SERVICE_COMMISSION_REFUND(saveData);
                NEW_REFUNDED_COMMISSION.save();
            }
            else {
                total_refund_commission.total_refunded += sellerCom;
                total_refund_commission.save();
            }

            res.status(200).json({
                status: true,
                message: "Data successfully edited.",
                data: docs
            });
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: "Invalid id. Server error.",
                error: err.message
            });
        });
}

var getApprovedRefundList = async (req, res) => {
    var approvedRefunds = await SERVICE_REFUND.aggregate([
        {
            $match: {
                request_status: "approved"
            }
        },
        {
            $lookup: {
                from: "servicecarts",
                localField: "order_id",
                foreignField: "order_id",
                as: "cart_items"
            }
        },
        {
            $unwind: "$cart_items"
        },
        {
            $lookup: {
                from: "sellers",
                localField: "seller_id",
                foreignField: "seller_id",
                as: "seller_details"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user_details"
            }
        }
    ]).exec();
    console.log("Approved refunds ", approvedRefunds);

    if (approvedRefunds.length > 0) {
        return res.status(200).json({
            status: true,
            message: "Data successfully get.",
            data: approvedRefunds
        });
    }
    else {
        return res.status(200).json({
            status: true,
            message: "No approved request.",
            data: []
        });
    }
}

var rejectRefund = async (req, res) => {
    var id = req.params.id;

    return SERVICE_REFUND.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(id) },
        {
            $set: {
                request_status: "rejected",
                admin_status: "refund_rejected"
            }
        },
        { new: true }
    )
        .then(docs => {
            res.status(200).json({
                status: true,
                message: "Data successfully edited.",
                data: docs
            });
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: "Invalid id. Server error.",
                error: err.message
            });
        });
}

var adminInitiateRefund = async (req, res) => {
    var id = req.params.id;

    return SERVICE_REFUND.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: { admin_status: "refund_initiated" } },
        { new: true }
    )
        .then(docs => {
            SERVICE_CART.findOneAndUpdate(
                { _id: docs.cart_id }, 
                { $set: { refund_request: "refund_initiated" } }
            ).exec();
            
            res.status(200).json({
                status: true,
                message: "Data successfully edited.",
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
    getAllRefundRequests,
    approveRefund,
    getApprovedRefundList,
    rejectRefund,
    adminInitiateRefund
}