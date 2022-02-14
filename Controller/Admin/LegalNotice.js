const LEGAL_NOTICE = require('../../Models/legal_notice');

var getNewNotices = async (req, res) => {
    let notices = await LEGAL_NOTICE.find({ status: true }).exec();

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
    getNewNotices
}