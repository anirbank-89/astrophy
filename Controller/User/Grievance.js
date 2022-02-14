var mongoose = require('mongoose');
const { Validator } = require('node-input-validator');

const GRIEVANCE = require('../../Models/grievance');
var Upload = require('../../service/upload');

var reportGrievance = async (req, res) => {
    const V = new Validator(req.body, {
        fullname: 'required',
        email: 'required|email',
        report_against: 'required',
        report_details: 'required'
    });
    let matched = await V.check().then(val => val);

    if (!matched) {
        return res.status(400).json({ status: false, errors: V.errors });
    }

    if (req.file == "" || req.file == null || typeof req.file == "undefined") {
        return res.status(400).send({
            status: false,
            error: {
                "file": {
                    "message": "The file field is mandatory.",
                    "rule": "required"
                }
            }
        });
    }

    var fileUrl = await Upload.uploadDocFile(req, "grievances");

    let saveData = {
        _id: mongoose.Types.ObjectId(),
        fullname: req.body.fullname,
        email: req.body.email,
        report_against: req.body.report_against,
        report_details: req.body.report_details,
        file: fileUrl
    }
    if(req.body.phone != "" || req.body.phone != null || typeof req.body.phone != "undefined") {
        saveData.phone = req.body.phone;
    }
    if(req.body.url != "" || req.body.url != null || typeof req.body.url != "undefined") {
        saveData.url = req.body.url;
    }

    const NEW_GRIEVANCE = new GRIEVANCE(saveData);

    return NEW_GRIEVANCE.save()
        .then(docs => {
            res.status(200).json({
                status: true,
                message: "Data added successfully",
                data: docs
            });
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: "Failed to add data. Server error.",
                error: err.message
            });
        });
}

module.exports = {
    reportGrievance
}