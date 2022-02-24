var mongoose = require('mongoose');

const REVIEWS = require('../../Models/servicereview');

var getReviews = async (req,res) => {
    return REVIEWS.aggregate([
        {
            $lookup: {
                from: "shop_services",
                localField: "service_id",
                foreignField: "_id",
                as: "service_data"
            }
        },
        {
            $unwind: {
                path: "$service_data",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "seller_id",
                foreignField: "_id",
                as: "seller_data"
            }
        },
        {
            $unwind: {
                path: "$seller_data",
                preserveNullAndEmptyArrays: true
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
            $unwind: {
                path: "$user_data",
                preserveNullAndEmptyArrays: true
            }
        },
        { $sort: { _id: -1 } }
    ])
        .then(docs => {
            res.status(200).json({
                status: true,
                message: "Data successfully get.",
                data: docs
            });
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: "Failed to get data. Server error.",
                error: err
            });
        });
}

var deleteRev = async (req,res) => {
    var id = req.params.id;

    return REVIEWS.findOneAndDelete({ _id: mongoose.Types.ObjectId(id) })
    .then(docs => {
        res.status(200).json({
            status: true,
            message: "Data successfully deleted.",
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
    getReviews,
    deleteRev
}