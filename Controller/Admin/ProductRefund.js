var mongoose = require('mongoose');

const PRODUCT_REFUND = require('../../Models/product_refund');

var getAllRefundRequests = async (req,res) => {
    var refundRequests = await PRODUCT_REFUND.aggregate([
        {
            $match: {
                request_status: "new"
            }
        },
        {
            $lookup: {
                from: "carts",
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

var approveRefund = async (req,res) => {
    var id = req.params.id;

    return PRODUCT_REFUND.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(id) }, 
        { $set: { request_status: "approved" } }, 
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

var getApprovedRefundList = async (req,res) => {
    var approvedRefunds = await PRODUCT_REFUND.aggregate([
        {
            $match: {
                request_status: "approved"
            }
        },
        {
            $lookup: {
                from: "carts",
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

var rejectRefund = async (req,res) => {
    var id = req.params.id;

    return PRODUCT_REFUND.findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(id) }, 
        { $set: { request_status: "rejected" } }, 
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

module.exports = {
    getAllRefundRequests,
    approveRefund,
    getApprovedRefundList,
    rejectRefund,
}