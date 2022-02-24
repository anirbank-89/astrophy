var mongoose = require('mongoose');

const { Validator } = require('node-input-validator');

var ContactUs = require("../../Models/seller_contactus");
const USER_QUERIES = require('../../Models/user_queries');
const EMAIL_SEND = require('../../service/emailsend');

const contactUsInfo = async (req, res) => {
    const v = new Validator(req.body, {
        name: "required",
        email: "required|email",
        // cat_id : "required",
        message: "required"

    })
    let matched = await v.check().then((val) => val)

    if (!matched) {
        return res.status(400).json({ status: false, error: v.errors })
    }

    let contactus = {
        _id: mongoose.Types.ObjectId(),
        name: req.body.name,
        email: req.body.email,
        // cat_id : req.body.cat_id,
        message: req.body.message

    }

    const contactSave = new ContactUs(contactus)

    return contactSave
        .save()
        .then((data) => {
            // EMAIL_SEND.grievance(data.email);
            res.status(200).json({
                status: true,
                data: data,
                message: "Info saved successfully"
            })
        })
        .catch((err) => {
            res.status(500).json({
                status: false,
                message: "error. Please try again.",
                error: err.message,
            });
        })
}

var contactUsInfo2 = async (req, res) => {
    const V = new Validator(req.body, {
        user_type: 'required',
        email: 'required|email',
        question: 'required'
    });
    let matched = await V.check().then(val => val);

    if (!matched) {
        return res.status(400).json({ status: false, errors: V.errors });
    }

    let saveData = {
        _id: mongoose.Types.ObjectId(),
        user_type: req.body.user_type,
        email: req.body.email,
        question: req.body.question
    }
    if (req.body.additional_details != null || typeof req.body.additional_details != "undefined") {
        saveData.additional_details = req.body.additional_details;
    }

    const NEW_GRIEVANCE = new USER_QUERIES(saveData);

    return NEW_GRIEVANCE.save()
        .then(data => {
            console.log("receive mail", data.receive_mail);
            console.log("user email ", data.email);
            console.log("question ", data.question);
            console.log("addtional details ", data.additional_details);

            var send_mail = EMAIL_SEND.queries(data.receive_mail,data.email,data.question,data.additional_details);

            res.status(200).json({
                status: true,
                message: "Data saved successfully!",
                data: data
            });
        })
        .catch(err => {
            res.status(500).json({
                status: false,
                message: "Failed to save data. Server error.",
                error: err.message
            });
        });
}

module.exports = {
    contactUsInfo,
    contactUsInfo2
}
