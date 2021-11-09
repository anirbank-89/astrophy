var mongoose = require('mongoose');
const { Validator } = require('node-input-validator');

const LEGAL_NOTICE = require('../../Models/legal_notice');
var Upload = require('../../service/upload');

var addLegalNotice = async (req, res) => {
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

    let saveData = {
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
        saveData.phone = Number(req.body.phone);
    }
    if (
        req.body.url != '' ||
        req.body.url != null ||
        typeof req.body.url != "undefined"
    ) {
        saveData.url = req.body.url;
    }
    if (
        req.file != '' ||
        req.file != null ||
        typeof req.file != "undefined"
    ) {
        var attachment_url = await Upload.uploadFile(req, "legal_notices");
        saveData.attachment = attachment_url;
    }

    const NEW_NOTICE = new LEGAL_NOTICE(saveData);

    return NEW_NOTICE.save((err, docs) => {
        if (!err) {
            res.status(200).json({
                status: true,
                message: "Notice issued successfully.",
                data: docs
            });
        }
        else {
            res.status(500).json({
                status: false,
                message: "Failed to issue notice. Server error.",
                error: err
            });
        }
    });
}

module.exports = {
    addLegalNotice
}