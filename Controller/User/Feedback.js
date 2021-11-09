var mongoose = require('mongoose');
const { Validator } = require('node-input-validator');

const FEEDBACK_MODEL = require('../../Models/feedback');

var addFeedback = async (req,res)=>{
    const V = new Validator(req.body, {
        name: 'required',
        email: 'required|email',
        feedback_detail: 'required'
    });
    let matched = V.check().then(val=>val);

    if (!matched) {
        return res.status(400).json({ status: false, errors: V.errors });
    }

    let feedbackData = {
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        email: req.body.email,
        feedback_detail: req.body.feedback_detail
    }

    const NEW_FEEDBACK = new FEEDBACK_MODEL(feedbackData);

    return NEW_FEEDBACK.save((err,docs)=>{
        if (!err) {
            res.status(200).json({
                status: true,
                message: "Feedback given successfully.",
                data: docs
            });
        }
        else {
            res.status(500).json({
                status: false,
                message: "Failed to give feedback. Server error.",
                error: err.message
            });
        }
    });
}

module.exports = {
    addFeedback
}