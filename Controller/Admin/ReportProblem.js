const PROBLEM_REPORT = require('../../Models/user_problems');

var getNewReports = async (req, res) => {
    return PROBLEM_REPORT.aggregate([
        {
            $match: {
                status: true
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "userid",
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
        .then(docs => {
            if (docs.length > 0) {
                res.status(200).json({
                    status: true,
                    message: "Data successfully get.",
                    data: docs
                });
            }
            else {
                res.status(200).json({
                    status: true,
                    message: "No new problem reports",
                    data: []
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: "Failed to get data. Server error"
            });
        });
}

module.exports = {
    getNewReports
}