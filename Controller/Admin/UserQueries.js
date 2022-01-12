const USER_QUERIES = require('../../Models/user_queries');

var getUserQueries = async (req,res) => {
    let queries = await USER_QUERIES.find({}).exec();

    if (queries.length > 0) {
        return res.status(200).json({
            status: true,
            message: "Data successfully get.",
            data: queries
        });
    }
    else {
        return res.status(200).json({
            status: true,
            message: "No unresolved queries.",
            data: []
        });
    }
}

module.exports = {
    getUserQueries
}