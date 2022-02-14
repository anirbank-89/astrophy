const GRIEVANCE = require('../../Models/grievance');

var getNewGrievances = async (req, res) => {
    let notices = await GRIEVANCE.find({ resolution_status: false }).exec();

    if (notices.length > 0) {
        return res.status(200).json({
            status: true,
            message: "Data successfully get.",
            data: notices
        });
    }
    else {
        return res.status(200).json({
            status: true,
            message: "No new notices.",
            data: []
        });
    }
}

module.exports = {
    getNewGrievances
}