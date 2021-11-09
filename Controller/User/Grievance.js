var mongoose = require('mongoose');
const { Validator } = require('node-input-validator');

const COMPLAINT_MODEL = require('../../Models/grievance');
var Upload = require('../../service/upload');

var addGrievance = async (req, res) => {
    const V = new Validator(req.body, {
        name: 'required',
        email: 'required|email',
        report_against: 'required',
        report_detail: 'required'
    });
    let matched = V.check().then(val => val);

    if (!matched) {
        return res.status(400).json({ status: false, errors: V.errors });
    }

    let complaintData = {
        _id: mongoose.Types.ObjectId(),
        user_id: mongoose.Types.ObjectId(req.body.user_id),
        name: req.body.name,
        email: req.body.email,
        report_against: req.body.report_against,
        report_detail: req.body.report_detail
    }
    if (
        req.body.phone != '' ||
        req.body.phone != null ||
        typeof req.body.phone != "undefined"
    ) {
        complaintData.phone = Number(req.body.phone);
    }
    if (
        req.body.url != '' ||
        req.body.url != null ||
        typeof req.body.url != "undefined"
    ) {
        complaintData.url = req.body.url;
    }
    if (
        req.file != '' ||
        req.file != null ||
        typeof req.file != "undefined"
    ) {
        var attachment_url = await Upload.uploadFile(req, "grievances");
        complaintData.attachment = attachment_url;
    }

    const NEW_COMPLAINT = new COMPLAINT_MODEL(complaintData);

    return NEW_COMPLAINT.save((err, docs) => {
        if (!err) {
            res.status(200).json({
                status: true,
                message: "Complaint registered successfully.",
                data: docs
            });
        }
        else {
            res.status(500).json({
                status: false,
                message: "Failed to register complaint. Server error.",
                error: err
            });
        }
    });
}

module.exports = {
    addGrievance
}