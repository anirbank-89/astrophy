const FEEDBACK_MODEL = require('../../Models/feedback');

var viewAllFeedback = async (req, res) => {
    var feedback = await FEEDBACK_MODEL.find().exec();

    if (feedback.length > 0) {
        return res.status(200).json({
            status: true,
            message: "Data successfully get.",
            data: feedback
        });
    }
    else {
        return res.status(200).json({
            status: true,
            message: "No feedback given.",
            data: null
        });
    }
}

var viewFeedbackById = async (req, res) => {
    var id = req.params.id;

    return FEEDBACK_MODEL.findById(
        { _id: id },
        (err, docs) => {
            if (!err) {
                res.status(200).json({
                    status: true,
                    message: "Data successfully get.",
                    data: docs
                });
            }
            else {
                res.status(500).json({
                    status: false,
                    message: "Invalid id.",
                    error: err.message
                });
            }
        }
    );
}

module.exports = {
    viewAllFeedback,
    viewFeedbackById
}