const USER_QUERIES = require('../../Models/user_queries');

var getUserQueries = async (req,res) => {
    return USER_QUERIES.aggregate([
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
            if (data.length > 0) {
                res.status(200).json({
                    status: true,
                    message: "Data successfully get.",
                    data: data
                });
            }
            else {
                res.status(200).json({
                    status: true,
                    message: "No user queries.",
                    data: []
                });
            }
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: "Failed to get data. Server error.",
                error: err.message
            });
        });
}

module.exports = {
    getUserQueries
}