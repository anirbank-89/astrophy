var mongoose = require('mongoose');
const COMPLAINT_MODEL = require('../../Models/grievance');

var viewAllComplaints = async (req, res) => {
    return COMPLAINT_MODEL.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "user_id",
                foreignField: "_id",
                as: "user_data"
            }
        },
        {
            $project: {
                __v: 0
            }
        }
    ])
        .then(data => {
            res.status(200).json({
                status: true,
                message: "Data successfully get.",
                data: data
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

var viewComplaintById = async (req, res) => {
    var id = req.params.id;

    return COMPLAINT_MODEL.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(id)
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
            $project: {
                __v: 0
            }
        }
    ])
        .then(data => {
            res.status(200).json({
                status: true,
                message: "Data successfully get.",
                data: data
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

module.exports = {
    viewAllComplaints,
    viewComplaintById
}